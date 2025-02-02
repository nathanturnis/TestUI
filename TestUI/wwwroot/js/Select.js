// Constants

const DROPDOWN_SELECTOR = ".nt-select-dropdown";
const DISPLAY_INPUT_SELECTOR = ".nt-select-dropdown-input";
const ITEMS_CONTAINER_SELECTOR = ".nt-select-list-content";
const DROPDOWN_MENU_SELECTOR = ".nt-select-dropdown-menu";

const DROPDOWN_ITEM_CLASS = "nt-select-dropdown-item";
const DROPDOWN_ITEM_SELECTOR = "." + DROPDOWN_ITEM_CLASS;

const DROPDOWN_TOGGLER_SELECTOR = ".nt-select-dropdown-toggler";
const HIDDEN_SELECT_SELECTOR = ".nt-select-hidden-select";

export class Select {
    constructor(config) {
        console.log(config);
        this.id = config.Id;

        this.initializeElements();
        this.initalizeListeners();
        this.clearSelectedItem();
        this.findDefaultSelectedItem();
    }

    /**
     * Caches some common elements needed for the select.
     */
    initializeElements() {
        this.$dropdown = $(`#NtSelect_${this.id}`);
        this.$hiddenSelect = this.$dropdown.find(HIDDEN_SELECT_SELECTOR);
        this.$dropdownMenu = this.$dropdown.find(DROPDOWN_MENU_SELECTOR);
        this.$itemsContainer = this.$dropdownMenu.find(ITEMS_CONTAINER_SELECTOR);
        this.$displayInput = this.$dropdown.find(DISPLAY_INPUT_SELECTOR);
    }

    initalizeListeners() {
        let self = this;

        this.$dropdown.on('click', DROPDOWN_ITEM_SELECTOR, function () {
            self.selectItem($(this));
        });


        // Accessibility stuff
        this.$dropdown.on("keypress", DROPDOWN_ITEM_SELECTOR, function (e) {
            let key = e.which;
            if (key == 13) {
                self.selectItem($(this));
                self.$dropdown.find(DROPDOWN_TOGGLER_SELECTOR).dropdown('toggle');
            }
        });

        this.$displayInput.on("keypress", function (e) {
            e.preventDefault();
            let key = e.which;
            if (key == 13) {
                self.$dropdown.find(DROPDOWN_TOGGLER_SELECTOR).dropdown('toggle');
            }
        });
    }

    /**
     * Selects the item
     * @param {any} $el the item to select
     */
    selectItem($el) {

        $(`#${this.id} option:first`).val($el.attr("data-value"));
        this.$displayInput.val($el.text().trim());
        this.$dropdown.find('.check-icon').hide();
        $el.find('.check-icon').show();
        this.$hiddenSelect.trigger('change');
    }

    /**
     * Clears the selected item.
     */
    clearSelectedItem() {
        this.$displayInput.val('');
        this.$dropdown.find('.check-icon').hide();
    }

    /**
     * Finds the first defaulted selected item and selects it if found.
     */
    findDefaultSelectedItem() {
        let $selectedElement = this.$itemsContainer.find(`${DROPDOWN_ITEM_SELECTOR}[data-selected='True']`).first();
        if ($selectedElement.length == 1) {
            this.selectItem($selectedElement);
        }
    }

}

// Creates the object.
if (window.testUI) {
    window.testUI.components.Select = Select;
}