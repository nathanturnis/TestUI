// Constants

const DROPDOWN_SELECTOR = ".nt-select-dropdown";
const DISPLAY_INPUT_SELECTOR = ".nt-select-dropdown-input";
const ITEMS_CONTAINER_SELECTOR = ".nt-select-list-content";
const DROPDOWN_MENU_SELECTOR = ".nt-select-dropdown-menu";

const DROPDOWN_TOGGLE_CLASS = "nt-select-toggle-button";
const DROPDOWN_TOGGLE_SELECTOR = "." + DROPDOWN_TOGGLE_CLASS;

const DROPDOWN_ITEM_CLASS = "nt-select-dropdown-item";
const DROPDOWN_ITEM_SELECTOR = "." + DROPDOWN_ITEM_CLASS;

const DEFAULT_ITEM_HEIGHT = 32;

export class Select {
    constructor(config) {
        console.log(config);
        this.id = config.Id;

        this.initializeElements();
        this.initalizeListeners();
    }

    /**
     * Caches some common elements needed for the select.
     */
    initializeElements() {
        this.$dropdown = $(`#NtSelect_${this.id}`);
        this.$dropdownMenu = this.$dropdown.find(DROPDOWN_MENU_SELECTOR);
        this.$itemsContainer = this.$dropdownMenu.find(ITEMS_CONTAINER_SELECTOR);
        this.$displayInput = this.$dropdown.find(DISPLAY_INPUT_SELECTOR);
    }

    initalizeListeners() {
        let self = this;

        this.$dropdown.on('click', DROPDOWN_ITEM_SELECTOR, function () {
            self.selectItem($(this));
        });
    }

    selectItem($el) {

        $(`#${this.id} option:first`).val($el.text().trim());
        console.log($(`#${this.id}`).val());

        this.$displayInput.val($el.text().trim());
        this.$dropdown.find('.check-icon').hide();
        $el.find('.check-icon').show();
    }

}

// Creates the object.
if (window.testUI) {
    window.testUI.components.Select = Select;
}