// Constants

const DROPDOWN_SELECTOR = ".nt-autocomplete-dropdown";
const SEARCH_INPUT_SELECTOR = ".nt-autocomplete-input";
const VALUE_INPUT_SELECTOR = ".nt-autocomplete-value";
const CLEAR_BUTTON_SELECTOR = ".nt-autocomplete-clear-button";
const HIDDEN_TOGGLE_SELECTOR = ".nt-autocomplete-hidden-toggle";
const ITEMS_CONTAINER_SELECTOR = ".nt-autocomplete-list-content";
const DROPDOWN_MENU_SELECTOR = ".nt-autocomplete-dropdown-menu";

const DROPDOWN_TOGGLE_CLASS = "nt-autocomplete-toggle-button";
const DROPDOWN_TOGGLE_SELECTOR = "." + DROPDOWN_TOGGLE_CLASS;

const DROPDOWN_ITEM_CLASS = "nt-autocomplete-dropdown-item";
const DROPDOWN_ITEM_SELECTOR = "." + DROPDOWN_ITEM_CLASS;

const DEFAULT_ITEM_HEIGHT = 32;

export class AutoComplete {
    constructor(config) {
        this.id = config.Id;
        this.items = config.Items;
        this.virtualize = config.Virtualize;
        this.filteredItems = [];
        this.selectedDisplayVal = '';

        if (config.Value != null) this.defaultValue = config.Value;
        if (config.Items != null) this.lowerObjectPropertyNames(this.items);

        this.itemValProp = config.ValueProperty?.toLowerCase();
        this.itemDisplayProp = config.DisplayProperty?.toLowerCase();
        this.searchUrl = config.SearchUrl;
        this.isServerFetching = this.searchUrl != null && this.searchUrl.trim() !== '';
        this.searchDelay = config.SearchDelay;

        this.initializeElements()

        if (!this.isServerFetching) {
            if (this.virtualize) {
                this.filteredItems = this.items;
                this.renderVirtualizedItems(0, false);
            } else {
                this.renderListItems(this.items, false)
            }
        } else if (config.FetchServerOnLoad) {
            this.fetchServerOnLoad = true;
            this.fetchServerData('', false);
        } else {
            this.renderListItems([], false);
        }

        this.initializeListeners();
    }

    /**
     * Caches some common elements needed for the autocomplete.
     */
    initializeElements() {
        this.$dropdown = $(`#AutoComplete_${this.id}`);
        this.$dropdownMenu = this.$dropdown.find(DROPDOWN_MENU_SELECTOR);
        this.$searchInput = this.$dropdown.find(SEARCH_INPUT_SELECTOR);
        this.$input = this.$dropdown.find(VALUE_INPUT_SELECTOR);
        this.$clearButton = this.$dropdown.find(CLEAR_BUTTON_SELECTOR);
        this.$toggleButton = this.$dropdown.find(HIDDEN_TOGGLE_SELECTOR);
        this.$itemsContainer = this.$dropdownMenu.find(ITEMS_CONTAINER_SELECTOR);
        this.dropdownInstance = bootstrap.Dropdown.getInstance(this.$toggleButton) || new bootstrap.Dropdown(this.$toggleButton);
    }

    /**
     * Initalize the listeners for the autocomplete.
     */
    initializeListeners() {
        let self = this;

        if (this.defaultValue != null) {
            this.setInitialValue();
        } else {
            this.clearSelectedItem();
        }

        // Anytime we click, we need to clear all autocomplete dropdowns.
        $(document).off('click.nt-autocompletes').on('click.nt-autocompletes', function (e) {
            self.clearMenus(e)
        });

        this.$dropdown.on('focusin', SEARCH_INPUT_SELECTOR, function (e) {
            let needToCloseDropdown = $(e.relatedTarget).hasClass(DROPDOWN_TOGGLE_CLASS) && self.$toggleButton.hasClass('show');
            let isItemSelected = self.isItemSelected;

            if (isItemSelected && !needToCloseDropdown) {
                self.showDropdown()
                return;
            }

            if (self.isServerFetching && !self.fetchServerOnLoad && self.items == null) return;

            let val = $(this).val();
            if (!self.isServerFetching) {
                self.searchList(val, !needToCloseDropdown)
            }

            if (!needToCloseDropdown) self.showDropdown();

        }).on('input', SEARCH_INPUT_SELECTOR, function () {
            let val = $(this).val();

            if (!self.isServerFetching) {
                self.searchList(val, true);
            } else {
                clearTimeout(self.serverDebounce); // Clear any previous timer
                self.serverDebounce = setTimeout(function () {
                    self.fetchServerData(val); // Call the fetchServerData after the delay
                }, self.searchDelay);
            }
        });

        this.$dropdown.on('hide.bs.dropdown', function () {
            if (self.isItemSelected) {
                let selectedDisplayVal = self.selectedDisplayVal;
                let searchVal = self.$searchInput.val();
                if (searchVal.trim().toLowerCase() !== selectedDisplayVal.trim().toLowerCase()) {
                    self.$searchInput.val(selectedDisplayVal);

                    self.renderListItems([self.selectedItem], false);
                }
            } else {
                self.$searchInput.val('');

                if (!self.isServerFetching) {
                    self.searchList('', false)
                } else {
                    if (self.virtualize) {
                        self.filteredItems = self.items || [];
                        self.renderVirtualizedItems(0, true);
                    } else {
                        self.renderListItems(self.items || [], false)
                    }
                }
            }

        })

        this.$dropdownMenu.on('click', DROPDOWN_ITEM_SELECTOR, function () {
            self.selectItem($(this));
        });

        this.$dropdown.find(DROPDOWN_TOGGLE_SELECTOR).on('click', function () {
            let needToClose = self.$toggleButton.hasClass('show');
            self.$searchInput.trigger('focus');
            if (needToClose) self.dropdownInstance.hide();
        });

        this.$dropdown.find(CLEAR_BUTTON_SELECTOR).on('click', function () {
            self.clearSelectedItem();
            self.$searchInput.trigger('focus');
        });

        if (this.virtualize) {
            this.$dropdown.on('shown.bs.dropdown', function () {
                self.calculateItemHeight();
            });
            this.$itemsContainer.on('scroll', function () {
                self.onScroll();
            });

            // These listeners will have to be created for each virtualized autocomplete on the page.
            $(document).on("visibilitychange", () => {
                if (document.visibilityState === "visible" && self.isDropdownOpen()) {
                    self.refreshVirtualization();
                }
            });
            $(window).on("focus", () => {
                if (self.isDropdownOpen()) {
                    self.refreshVirtualization();
                }
            });
        }
    }

    /**
     * Sets the inital value of the AutoComplete.
     * @returns
     */
    setInitialValue() {
        if (this.defaultValue == null) return;
        if (Array.isArray(this.defaultValue)) return;

        let defaultVal = this.defaultValue;
        if (typeof this.defaultValue !== 'object') {
            this.selectedDisplayVal = defaultVal;
            this.$input.val(defaultVal);
        } else {
            this.lowerObjectPropertyNames(defaultVal);
            let valueProp = this.itemValProp;
            let displayProp = this.itemDisplayProp;
            if (!defaultVal.hasOwnProperty(valueProp)) throw new Error(`Could not find property of name '${valueProp}'`);
            if (!defaultVal.hasOwnProperty(displayProp)) throw new Error(`Could not find property of name '${displayProp}'`);

            this.selectedDisplayVal = defaultVal[displayProp];
            this.$input.val(defaultVal[valueProp])
        }

        this.selectedItem = defaultVal;
        this.isItemSelected = true;

        this.$searchInput.val(this.selectedDisplayVal);
        this.$clearButton.removeClass('d-none');

        this.renderListItems([defaultVal], false);
    }

    /**
     * Shows the dropdown.
     */
    showDropdown() {
        this.$itemsContainer.scrollTop(0);
        this.dropdownInstance.show();
    }

    /**
     * Is the dropdown currently open
     * @returns True if dropdown is open, false otherwise
     */
    isDropdownOpen() {
        return this.$toggleButton.hasClass('show');
    }

    /**
     * Clears open autocomplete menus excpet for the one we interact with.
     * @param {any} e The event calling the clear.
     */
    clearMenus(e) {
        // **** Do not use this.{propertyName} because this will only reference most recently rendered autocomplete ****
        var $target = $(e.target);
        var isDropdownItem = $target.hasClass(DROPDOWN_ITEM_CLASS);
        var isClearButton = $target.closest(CLEAR_BUTTON_SELECTOR).length >= 1;
        var allToggles = $(HIDDEN_TOGGLE_SELECTOR);

        var relatedDropdown = $(e.target).parents(DROPDOWN_SELECTOR).first().find(HIDDEN_TOGGLE_SELECTOR);
        if (relatedDropdown.length > 0) var relatedDropdownInstance = bootstrap.Dropdown.getInstance(relatedDropdown);
        allToggles.each(function () {
            let instance = bootstrap.Dropdown.getInstance($(this));
            if (instance != relatedDropdownInstance || isDropdownItem || isClearButton) {
                instance.hide();
            }
        });
    }

    /**
     * Renders list items in the dropdown.
     * @param {any} visibleItems The items to render
     * @param {any} isFromServer Whether or not these items are from a remote source.
     * @returns
     */
    renderListItems(visibleItems, isFromServer, startIndex = 0) {
        if (visibleItems.length <= 0) {
            this.$itemsContainer.html(this.getNoResultsFoundHtml());
            return;
        }

        let html = ``;
        let valueProp = this.itemValProp;
        let displayProp = this.itemDisplayProp;

        let input = $(`#AutoComplete_${this.id}`).find(VALUE_INPUT_SELECTOR);


        visibleItems.forEach((item, index) => {
            if (item == null) return;

            let val = '';
            let display = '';

            // If not an object (just string array for example) ignore value and display prop.
            if (typeof item !== "object") {
                val = item;
                display = item;
            } else {
                if (!item.hasOwnProperty(valueProp)) throw new Error(`Could not find property of name '${valueProp}'`);
                if (!item.hasOwnProperty(displayProp)) throw new Error(`Could not find property of name '${displayProp}'`);

                val = item[valueProp];
                display = item[displayProp];
            }


            html += `<div class="dropdown-item py-1 d-flex justify-content-between ${DROPDOWN_ITEM_CLASS}" data-value="${val}" data-from-server="${isFromServer}" data-index="${startIndex + index}" style="cursor: pointer; ">
                                <span class="nt-autocomplete-dropdown-item-text">${display}</span>
                                <span class="float-end check-icon" style="${input.val() == val ? "" : "display: none"}"><i class="bi bi-check-lg"></i></span>
                            </div>`

        });
        this.$itemsContainer.html(html);
    }

    /**
     * Searches the non-virtualized list based on the query.
     * @param {any} search The search input value
     * @param {any} needToOpen Whether the dropdown needs to be opened
     * @returns
     */
    searchList(search, needToOpen) {
        // Early exit if search is empty
        search = search.trim().toLowerCase();

        this.currentSearchVersion = (this.currentSearchVersion || 0) + 1;
        const searchVersion = this.currentSearchVersion;

        if (!search) {
            clearTimeout(this.debounceTimeout);

            this.filteredItems = this.items;

            if (this.virtualize) {
                this.renderVirtualizedItems(0, false); // Re-render virtualization from the top
            } else {
                this.renderListItems(this.items, false);
            }

            if (needToOpen) this.showDropdown();
            return;
        }

        this.debounceTimeout = setTimeout(() => {
            if (searchVersion === this.currentSearchVersion) {
                this.filteredItems = this.items.filter(item => {
                    if (typeof item !== "object") return item.toLowerCase().includes(search);
                    else return item[this.itemDisplayProp].toLowerCase().includes(search);
                });

                if (this.virtualize) {
                    this.renderVirtualizedItems(0, false);
                } else {
                    this.renderListItems(this.filteredItems, false);
                }
            }

            if (needToOpen) this.showDropdown();
        }, this.searchDelay);
    }

    /**
     * Selects the item.
     * @param {any} $el The element to select.
     */
    selectItem($el) {
        let displayVal = $el.text().trim();
        this.selectedDisplayVal = displayVal;
        let selectedIndex = $el.attr('data-index');
        this.isItemSelected = true;

        if ($el.attr('data-from-server') == 'false' || $el.attr('data-from-server') == false) {
            this.selectedItem = this.items[selectedIndex]
            this.filteredItems = this.items.filter(item => {
                if (typeof item !== "object") return item === displayVal;
                else return item[this.itemDisplayProp] === displayVal;
            });
        } else {
            this.selectedItem = this.filteredItems[selectedIndex];
            this.filteredItems = this.filteredItems.filter(item => {
                if (typeof item !== "object") return item === displayVal;
                else return item[this.itemDisplayProp] === displayVal;
            });
        }

        this.$searchInput.val(displayVal);
        this.$dropdown.find('.check-icon').hide();
        $el.find('.check-icon').show();
        this.$input.val($el.data("value"));
        this.$clearButton.removeClass('d-none');
        this.$input.trigger('input');
        this.$input.trigger('change');

        this.renderListItems(this.filteredItems, $el.attr('data-from-server'));
    }

    /**
     * Clears the selected item.
     */
    clearSelectedItem() {
        this.selectedItem = null;
        this.isItemSelected = false;
        this.filteredItems = [];
        this.selectedDisplayVal = '';
        this.$searchInput.val('');
        this.$input.val('');
        this.$clearButton.addClass('d-none');
        this.$dropdown.find('.check-icon').hide();
        this.$dropdownMenu.find(DROPDOWN_ITEM_SELECTOR).show();
        this.$input.trigger('input');
        this.$input.trigger('change');
    }


    /**
     * Fetches data from the server and updates the list.
     * @param {any} val Search string
     * @param {any} showDropdown Whether to show the dropdown
     */
    fetchServerData(val, showDropdown = true) {
        let self = this;
        this.$dropdownMenu.find(ITEMS_CONTAINER_SELECTOR).html(this.getLoadingHtml())
        if (showDropdown) self.showDropdown();

        this.currentSearchVersion = (this.currentSearchVersion || 0) + 1;
        const searchVersion = this.currentSearchVersion;
        $.ajax({
            url: this.searchUrl, // Endpoint
            type: "GET", // HTTP Method
            dataType: "json", // Expected response type
            data: { searchVal: val },
            success: function (response) {
                if (searchVersion === self.currentSearchVersion && self.isDropdownOpen()) {
                    if (self.fetchServerOnLoad && self.items == null) {
                        self.items = response;
                        self.lowerObjectPropertyNames(self.items);
                    }

                    self.filteredItems = response;
                    self.lowerObjectPropertyNames(self.filteredItems);

                    if (self.virtualize) {
                        self.renderVirtualizedItems(0, true);
                    } else {
                        self.renderListItems(self.filteredItems, true);
                    }

                    if (showDropdown) self.showDropdown();
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error.responseText);
            }
        });
    }

    // #region Virtualization

    /**
     * Called when the user scrolls in the virtualized container.
     */
    onScroll() {
        const scrollTop = this.$itemsContainer.scrollTop();
        const startIndex = Math.floor(scrollTop / this.itemHeight);

        this.renderVirtualizedItems(startIndex, this.isServerFetching);
    }

    /**
     * Calculates what items to render based on the scroll position
     * @param {any} startIndex The first item to render
     * @param {any} isFromServer Whether these items are from the server
     */
    renderVirtualizedItems(startIndex, isFromServer) {

        let dataSize = isFromServer ? this.filteredItems.length : this.items.length;
        const endIndex = Math.min(startIndex + (parseInt(this.$dropdownMenu.css('max-height')) / (this.itemHeight === undefined ? DEFAULT_ITEM_HEIGHT : this.itemHeight)) + 3, dataSize);

        let visibleItems = this.filteredItems.slice(startIndex, endIndex);

        this.$itemsContainer.empty(); // Clear current items

        this.renderListItems(visibleItems, isFromServer, startIndex);

        // Add padding for invisible items
        const topPadding = startIndex * this.itemHeight;
        const bottomPadding = (this.filteredItems.length - endIndex) * this.itemHeight;
        this.$itemsContainer.prepend(`<div style="height: ${topPadding}px;"></div>`);
        this.$itemsContainer.append(`<div style="height: ${bottomPadding}px;"></div>`);
    }

    /**
     * Refresh the virtualized container.
     */
    refreshVirtualization() {
        const scrollTop = this.$itemsContainer.scrollTop();
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        this.renderVirtualizedItems(startIndex, this.isServerFetching);
    }

    /**
     * Calculates the height of the first item in the list for virtualization. Default is 32px.
     * @returns
     */
    calculateItemHeight() {
        if (this.itemHeight != 0 && this.itemHeight != null && this.itemHeight != 'undefined') return;

        if (!this.virtualize)
            this.searchList('', false);

        const $firstItem = this.$itemsContainer.find(DROPDOWN_ITEM_SELECTOR).first();

        if ($firstItem.length <= 0) {
            this.itemHeight = DEFAULT_ITEM_HEIGHT;
        } else {
            this.itemHeight = $firstItem.outerHeight(); // Get the height of the first visible item
        }

        // Calculate the top and bottom padding of the container, providing an illusion of scroll.
        let dataSize = this.isServerFetching ? this.filteredItems.length : this.items.length;
        const endIndex = Math.min((parseInt(this.$dropdownMenu.css('max-height')) / (this.itemHeight === undefined ? DEFAULT_ITEM_HEIGHT : this.itemHeight)) + 3, dataSize);
        const topPadding = 0;
        const bottomPadding = (this.filteredItems.length - endIndex) * this.itemHeight;
        this.$itemsContainer.prepend(`<div style="height: ${topPadding}px;"></div>`);
        this.$itemsContainer.append(`<div style="height: ${bottomPadding}px;"></div>`);
    }

    // #endregion

    /**
     * Get the HTML shown when no results are found.
     * @returns Not found html
     */
    getNoResultsFoundHtml() {
        return "<div class=\"no-results-found\"><h5 class=\"dropdown-header\">No results found.</h5></div>";
    }





    lowerObjectPropertyNames(data) {
        if (Array.isArray(data)) {
            // If it's an array, process each object in the array
            data.forEach(item => this.lowerObjectPropertyNames(item));
        } else if (data && typeof data === 'object') {
            // If it's a single object, process its keys
            Object.keys(data).forEach(key => {
                let lowerKey = key.toLowerCase();
                if (lowerKey !== key) {
                    data[lowerKey] = data[key];
                    delete data[key];
                }
                // Recursively process nested objects
                if (typeof data[lowerKey] === 'object' && data[lowerKey] !== null) {
                    this.lowerObjectPropertyNames(data[lowerKey]);
                }
            });
        }

    }


    /**
     * Get the HTML shown for querying data.
     * @returns skeleton loading html
     */
    getLoadingHtml() {
        let html = ``;
        for (let i = 0; i < 10; i++) {
            html += `<p class="placeholder-wave px-3 my-1">
                        <span class="placeholder col-12 bg-secondary"></span>
                     </p>`;
        }
        return html;
    }
}

// Creates the object.
if (window.testUI) {
    window.testUI.components.AutoComplete = AutoComplete;
}