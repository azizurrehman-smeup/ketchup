import { dragMultipleImg } from '../../assets/images/drag-multiple';

import {
    Component,
    Event,
    Prop,
    Host,
    State,
    Watch,
    EventEmitter,
    h,
    Method,
    Element,
} from '@stencil/core';

import {
    Column,
    SortObject,
    SortMode,
    RowAction,
    Cell,
} from '../kup-data-table/kup-data-table-declarations';

import {
    BoxRow,
    Layout,
    Section,
    CollapsedSectionsState,
    BoxObject,
} from './kup-box-declarations';

import {
    isButton,
    isPassword,
    isIcon,
    isCheckbox,
    hasTooltip,
} from '../../utils/object-utils';

import {
    isEditor,
    isImage,
    isProgressBar,
    isRadio,
    isGauge,
    isKnob,
    isChart,
} from '../../utils/cell-utils';

import {
    filterRows,
    sortRows,
    paginateRows,
    getCellValueForDisplay,
} from '../kup-data-table/kup-data-table-helper';

import {
    setDragEffectAllowed,
    setKetchupDraggable,
    setKetchupDroppable,
    DragHandlers,
    DropHandlers,
} from '../../utils/drag-and-drop';

const KupBoxDragType = 'text/kup-box-drag';

import { ComponentCardElement } from '../kup-card/kup-card-declarations';
import { PaginatorMode } from '../kup-paginator/kup-paginator-declarations';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import { logLoad, logMessage, logRender } from '../../utils/debug-manager';
import { KupTooltip } from '../kup-tooltip/kup-tooltip';

import { KupBoxState } from './kup-box-state';
import { KupStore } from '../kup-state/kup-store';
import { setTooltip, unsetTooltip } from '../../utils/helpers';
import { identify, stringToNumber } from '../../utils/utils';
import { getColumnByName } from '../kup-data-table/kup-data-table-helper';

@Component({
    tag: 'kup-box',
    styleUrl: 'kup-box.scss',
    shadow: true,
})
export class KupBox {
    //////////////////////////////
    // Begin state stuff
    //////////////////////////////

    @Prop() stateId: string = '';
    @Prop() store: KupStore;

    state: KupBoxState = new KupBoxState();

    initWithPersistedState(): void {
        if (this.store && this.stateId) {
            const state = this.store.getState(this.stateId);
            if (state != null) {
                logMessage(
                    this,
                    'Initialize with state for stateId ' +
                        this.stateId +
                        ': ' +
                        state
                );
                // *** PROPS ***
                this.sortBy = this.state.sortBy;
                this.globalFilterValue = this.state.globalFilterValue;
                this.selectedRowsState = this.state.selectedRowsState;
                this.pageSelected = this.state.pageSelected;
                this.rowsPerPage = this.state.rowsPerPage;
            }
        }
    }

    persistState(): void {
        if (this.store && this.stateId) {
            // *** PROPS ***
            this.state.sortBy = this.sortBy;
            this.state.globalFilterValue = this.globalFilterValue;
            this.state.selectedRowsState = this.selectedRows.reduce(
                (accumulator, row, currentIndex) => {
                    const prefix = currentIndex > 0 ? ';' : '';
                    return accumulator + prefix + row.id;
                },
                ''
            );
            this.state.pageSelected = this.currentPage;
            this.state.rowsPerPage = this.currentRowsPerPage;
            logMessage(
                this,
                'Persisting state for stateId ' +
                    this.stateId +
                    ': ' +
                    this.state
            );
            this.store.persistState(this.stateId, this.state);
        }
    }

    //////////////////////////////
    // End state stuff
    //////////////////////////////

    @Element() rootElement: HTMLElement;
    @State() customStyleTheme: string = undefined;

    /**
     * Number of columns
     */
    @Prop() cardData: ComponentCardElement = undefined;
    /**
     * Number of columns
     */
    @Prop() columns: number = 1;
    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * Data
     */
    @Prop() data: { columns?: Column[]; rows?: BoxRow[] };
    /**
     * Enable dragging
     */
    @Prop() dragEnabled: boolean = false;
    /**
     * Enable dropping
     */
    @Prop() dropEnabled: boolean = false;
    /**
     * Drop can be done in section
     */
    @Prop() dropOnSection: boolean = false;
    /**
     * If enabled, a button to load / display the row actions
     * will be displayed on the right of every box
     */
    @Prop() enableRowActions: boolean = false;
    /**
     * When set to true it activates the global filter.
     */
    @Prop() globalFilter: boolean = false;
    /**
     * The value of the global filter.
     */
    @Prop({ reflect: true, mutable: true }) globalFilterValue = '';
    /**
     * How the field will be displayed. If not present, a default one will be created.
     */
    @Prop() layout: Layout;
    /**
     * Enable multi selection
     */
    @Prop() multiSelection: boolean = false;
    /**
     * Current page number
     */
    @Prop() pageSelected: number = 1;
    /**
     * Number of boxes per page
     */
    @Prop() pageSize: number = 10;
    /**
     * Enables pagination
     */
    @Prop() pagination: boolean = false;
    /**
     * Number of current rows per page
     */
    @Prop() rowsPerPage: number;
    /**
     * Automatically selects the box at the specified index
     */
    @Prop() selectBox: number;
    /**
     * Multiple selection
     */
    @Prop({ mutable: true }) selectedRowsState: string;
    /**
     * If enabled, highlights the selected box/boxes
     */
    @Prop() showSelection: boolean = true;
    /**
     * If set to true, displays tooltip on right click; if set to false, displays tooltip on mouseOver.
     */
    @Prop() showTooltipOnRightClick: boolean = true;
    /**
     * If sorting is enabled, specifies which column to sort
     */
    @Prop({ mutable: true }) sortBy: string;
    /**
     * Enable sorting
     */
    @Prop() sortEnabled: boolean = false;
    /**
     * Disable swipe
     */
    @Prop() swipeDisabled: boolean = false;
    /**
     * Defines the timeout for tooltip detail
     */
    @Prop() tooltipDetailTimeout: number;
    /**
     * Defines the timeout for tooltip load
     */
    @Prop() tooltipLoadTimeout: number;

    @State()
    private collapsedSection: CollapsedSectionsState = {};

    @State()
    private selectedRows: Array<BoxRow> = [];

    /**
     * Row that has the row object menu open
     */
    @State()
    private rowActionMenuOpened: BoxRow;

    @State()
    private currentPage = 1;

    @State()
    private currentRowsPerPage = 10;

    /**
     * Triggered when a box is clicked
     */
    @Event({
        eventName: 'kupBoxClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBoxClicked: EventEmitter<{
        row: BoxRow;
        column?: string;
    }>;

    /**
     * Triggered when the multi selection checkbox changes value
     */
    @Event({
        eventName: 'kupBoxSelected',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBoxSelected: EventEmitter<{
        rows: BoxRow[];
    }>;

    /**
     * Triggered when a box is auto selected via selectBox prop
     */
    @Event({
        eventName: 'kupAutoBoxSelect',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupAutoBoxSelect: EventEmitter<{
        row: BoxRow;
    }>;

    /**
     * When the row menu action icon is clicked
     */
    @Event({
        eventName: 'kupRowActionMenuClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupRowActionMenuClicked: EventEmitter<{
        row: BoxRow;
    }>;

    /**
     * When the row menu action icon is clicked
     */
    @Event({
        eventName: 'kupRowActionClicked',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupRowActionClicked: EventEmitter<{
        row: BoxRow;
        action: RowAction;
        index: number;
    }>;

    /**
     * Triggered when a box dragging is started
     */
    @Event({
        eventName: 'kupBoxDragStarted',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBoxDragStarted: EventEmitter<{
        fromId: string;
        fromRow: BoxRow;
        fromSelectedRows?: BoxRow[];
    }>;

    /**
     * Triggered when a box dragging is ended
     */
    @Event({
        eventName: 'kupBoxDragEnded',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBoxDragEnded: EventEmitter<{
        fromId: string;
        fromRow: BoxRow;
        fromSelectedRows?: BoxRow[];
    }>;

    @Event({
        eventName: 'kupDidLoad',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupDidLoad: EventEmitter<void>;

    /**
     * Triggered when stop propagation event
     */
    @Event({
        eventName: 'kupDidUnload',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupDidUnload: EventEmitter<void>;

    private boxLayout: Layout;

    private visibleColumns: Column[] = [];

    private rows: BoxRow[] = [];
    private filteredRows: BoxRow[] = [];

    private tooltip: KupTooltip;
    private globalFilterTimeout: number;

    @Watch('pageSize')
    rowsPerPageHandler(newValue: number) {
        this.currentRowsPerPage = newValue;
    }

    @Watch('globalFilterValue')
    @Watch('sortBy')
    @Watch('pagination')
    @Watch('pageSize')
    @Watch('currentPage')
    @Watch('currentRowsPerPage')
    recalculateRows() {
        this.initRows();
    }

    @Watch('data')
    onDataChanged() {
        identify(this.getRows());
        this.initVisibleColumns();
        this.initRows();
        this.checkLayout();
    }

    @Watch('layout')
    onLayoutChanged() {
        this.checkLayout();
    }

    @Watch('selectBox')
    onSelectBoxChanged() {
        this.handleAutomaticBoxSelection();
    }

    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);

        if (this.rowsPerPage) {
            this.currentRowsPerPage = this.rowsPerPage;
        } else if (this.pageSize) {
            this.currentRowsPerPage = this.pageSize;
        }
        setThemeCustomStyle(this);
        this.onDataChanged();
        this.adjustPaginator();
    }

    componentDidLoad() {
        this.handleAutomaticBoxSelection();

        // When component is created, then the listener is set. @See clickFunction for more details
        document.addEventListener('click', this.clickFunction.bind(this));

        this.currentPage = this.pageSelected;
        //        this.currentRowsPerPage = this.rowsPerPage;

        if (this.multiSelection && this.selectedRowsState) {
            this.selectedRows = [];
            let selectedIds: Array<string> = this.selectedRowsState.split(';');
            this.selectedRows = this.data.rows.filter((r) => {
                return selectedIds.indexOf(r.id) >= 0;
            });
        }
        this.kupDidLoad.emit();
        logLoad(this, true);
    }

    componentWillRender() {
        logRender(this, false);
    }

    componentDidRender() {
        // *** Store
        this.persistState();
        // ***
        logRender(this, true);
    }

    componentDidUnload() {
        this.kupDidUnload.emit();
        // When component is destroyed, then the listener is removed. @See clickFunction for more details
        document.removeEventListener('click', this.clickFunction.bind(this));
    }

    // @Methods
    @Method()
    async loadRowActions(row: BoxRow, actions: RowAction[]) {
        row.actions = actions;

        // show menu
        this.rowActionMenuOpened = row;
    }

    private getColumnByDesc(columns: Column[], title: string): Column {
        for (let column of columns) {
            if (column.title === title) {
                return column;
            }
        }
        return null;
    }

    // private methods
    private getColumns(): Array<Column> {
        return this.data && this.data.columns
            ? this.data.columns
            : [{ title: '', name: '', size: undefined }];
    }

    private initVisibleColumns(): void {
        this.visibleColumns = this.getColumns().filter((column) => {
            if (column.hasOwnProperty('visible')) {
                return column.visible;
            }

            return true;
        });
    }

    private getRows(): BoxRow[] {
        return this.data && this.data.rows ? this.data.rows : [];
    }

    private initRows(): void {
        this.filteredRows = this.getRows();

        if (this.globalFilter && this.globalFilterValue) {
            // filtering rows
            this.filteredRows = filterRows(
                this.filteredRows,
                null,
                this.globalFilterValue,
                this.visibleColumns
            );
        }

        this.rows = this.sortRows(this.filteredRows);

        if (this.pagination) {
            this.rows = paginateRows(
                this.rows,
                this.currentPage,
                this.currentRowsPerPage,
                false
            );
        }
    }

    private sortRows(rows: BoxRow[]): BoxRow[] {
        let sortedRows = rows;

        if (this.sortBy) {
            // create 'fake' sortObject
            const sortObject: SortObject = {
                column: this.sortBy,
                sortMode: SortMode.A,
            };

            sortedRows = sortRows(sortedRows, [sortObject]);
        }

        return sortedRows;
    }

    private checkLayout() {
        // check if there is a layout.
        // if not, create a default layout
        if (this.layout) {
            this.boxLayout = this.layout;
            return;
        }

        // only one section, containing all visible fields
        const section: Section = {
            horizontal: false,
            sections: [],
        };

        // adding box objects to section
        const visibleColumns = this.visibleColumns;
        let size = visibleColumns.length;
        let content = [];

        let cnt = 0;

        while (size-- > 0) {
            content.push({
                column: visibleColumns[cnt++].name,
            });
        }

        section.content = content;

        // creating a new layout
        this.boxLayout = {
            sections: [section],
        };
    }

    private onSortChange(e: CustomEvent) {
        let column = getColumnByName(this.visibleColumns, e.detail.value);
        this.sortBy = column.name;
    }

    private onGlobalFilterChange({ detail }) {
        let value = '';
        if (detail && detail.value) {
            value = detail.value;
        }
        this.globalFilterValue = value;
    }

    private isSectionExpanded(row: BoxRow, section: Section): boolean {
        if (!row.id || !section.id) {
            return false;
        }

        return (
            this.collapsedSection[section.id] &&
            this.collapsedSection[section.id][row.id]
        );
    }

    private handleAutomaticBoxSelection() {
        if (
            this.selectBox &&
            this.selectBox > 0 &&
            this.selectBox <= this.data.rows.length
        ) {
            this.selectedRows = [];

            for (let boxRow of this.data.rows) {
                if (boxRow.id === (this.selectBox - 1).toString()) {
                    this.selectedRows.push(boxRow);
                    break;
                }
            }
            this.kupAutoBoxSelect.emit({
                row: this.selectedRows[0],
            });
        }
    }

    /**
     * Checks if the element is the svg that opens the "row actions menu"
     * @param element the element to check
     */
    private checkIfElementIsActionMenuIcon(element: any) {
        if (element.tagName && element.parentElement) {
            return (
                element.tagName === 'svg' &&
                element.parentElement.classList.contains('row-actions-toggler')
            );
        }

        return false;
    }

    // event listeners
    private onBoxClick({ target }: MouseEvent, row: BoxRow) {
        if (!(target instanceof HTMLElement)) {
            return;
        }

        // searching parent
        let element = target;
        let classList = element.classList;

        while (
            !classList.contains('box-object') &&
            !classList.contains('box-section') &&
            !classList.contains('box')
        ) {
            element = element.parentElement;

            if (element === null) {
                break;
            }

            classList = element.classList;
        }

        // evaluating column
        let column = null;
        if (classList.contains('box-object')) {
            column = element.dataset.column;
        }

        this.kupBoxClicked.emit({ row, column });

        // selecting box
        if (this.multiSelection) {
            // triggering multi selection
            this.onSelectionCheckChange(row);
        } else {
            this.selectedRows = [row];
        }
    }

    private onSelectionCheckChange(row: BoxRow) {
        var index = -1;
        for (let i = 0; i < this.selectedRows.length; i++) {
            const select = this.selectedRows[i];
            if (select.id === row.id) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            // remove row
            this.selectedRows.splice(index, 1);
            this.selectedRows = [...this.selectedRows];
        } else {
            // add row
            this.selectedRows = [...this.selectedRows, row];
        }

        this.kupBoxSelected.emit({
            rows: this.selectedRows,
        });
    }

    private toggleSectionExpand(row: BoxRow, section: Section) {
        // check if section / row has id
        if (!section.id) {
            // error
            console.error('cannot expand / collapse a section withoun an ID');
            return;
        }

        if (!row.id) {
            // error
            console.error(
                'cannot expand / collapse a section of a row without ad id'
            );
            return;
        }

        // check if section already in collapsedSection
        if (!this.collapsedSection[section.id]) {
            // adding element and row, setting it to expanded
            this.collapsedSection[section.id] = {};
            this.collapsedSection[section.id][row.id] = true;
        } else {
            const s = this.collapsedSection[section.id];

            if (!s[row.id]) {
                s[row.id] = true;
            } else {
                s[row.id] = !s[row.id];
            }
        }

        // triggering rendering
        this.collapsedSection = { ...this.collapsedSection };
    }

    private onRowAction(row: BoxRow) {
        if (!row) {
            return;
        }

        if (row === this.rowActionMenuOpened) {
            // closing menu
            this.rowActionMenuOpened = null;
            return;
        }

        if (row.actions) {
            // actions already loaded -> show menu
            this.rowActionMenuOpened = row;
        } else {
            // no actions -> triggering event
            this.kupRowActionMenuClicked.emit({
                row,
            });
        }
    }

    private onRowActionClicked(row: BoxRow, action: RowAction, index: number) {
        this.kupRowActionClicked.emit({
            row,
            action,
            index,
        });
    }

    // when the dragged box is over the drop section (fired on the drop target)
    private onSectionDragOver(event: DragEvent) {
        event.preventDefault();

        let target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        this.searchParentWithClass(target, 'box-component').classList.add(
            'component-dropover'
        );
    }

    // when the dragged box leaves the drop section (fired on the drop target)
    private onSectionDragLeave(event: DragEvent) {
        let target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        this.searchParentWithClass(target, 'box-component').classList.remove(
            'component-dropover'
        );
    }

    private addMultiSelectDragImageToEvent(event: DragEvent) {
        var dragImage = document.createElement('img');
        dragImage.src = dragMultipleImg;
        event.dataTransfer.setDragImage(dragImage, 0, 0);
    }

    private searchParentWithClass(target: any, cssClass: string) {
        // searching parent until class is reached
        let element = target;
        let classList = element.classList;
        while (!classList.contains(cssClass)) {
            element = element.parentElement;
            if (element === null) {
                break;
            }
            classList = element.classList;
        }
        return element;
    }

    /**
     * see onDocumentClick in kup-combo
     */
    private clickFunction(event: UIEvent) {
        try {
            const targets = event.composedPath();

            for (let target of targets) {
                if (this.checkIfElementIsActionMenuIcon(target)) {
                    return;
                }
            }
        } catch (err) {
            if (this.checkIfElementIsActionMenuIcon(event.target)) {
                return;
            }
        }

        this.rowActionMenuOpened = null;
    }

    private handlePageChanged({ detail }) {
        this.currentPage = detail.newPage;
    }

    private _setTooltip(event: MouseEvent, cell: Cell) {
        setTooltip(event, cell, this.tooltip);
    }

    private _unsetTooltip() {
        unsetTooltip(this.tooltip);
    }

    private handleRowsPerPageChanged({ detail }) {
        this.currentRowsPerPage = detail.newRowsPerPage;
        this.adjustPaginator();
    }

    private adjustPaginator() {
        const numberOfRows = this.rows.length;

        // check if current page is valid
        const numberOfPages = Math.ceil(numberOfRows / this.currentRowsPerPage);
        if (this.currentPage > numberOfPages) {
            // reset page
            this.currentPage = 1;
        }
    }

    // render methods
    private renderSectionAsCard(row: BoxRow) {
        let cntBTN: number = 0;
        let cntIMG: number = 0;
        let cntPGB: number = 0;
        let cnt: number = 0;
        let cardData = {};

        //First cycle sets specific binds between cardIDs and cells
        for (var key in row.cells) {
            if (row.cells.hasOwnProperty(key)) {
                var cell = row.cells[key];
                if (cell.cardID) {
                    switch (cell.obj.p) {
                        case 'BTN':
                            cardData[cell.cardID] = {
                                label: cell.value,
                            };
                            break;
                        case 'IMG':
                            cardData[cell.cardID] = {
                                resource: cell.value,
                            };
                            break;
                        case 'PGB':
                            cardData[cell.cardID] = {
                                value: cell.value,
                            };
                            break;
                        default:
                            cardData[cell.cardID] = cell.value;
                            break;
                    }
                }
            }
        }

        //Second cycle sets leftover binds automatically
        for (var key in row.cells) {
            if (row.cells.hasOwnProperty(key)) {
                var cell = row.cells[key];
                switch (cell.obj.p) {
                    case 'BTN':
                        do {
                            cntBTN++;
                        } while (cardData['button' + cntBTN]);

                        cardData['button' + cntBTN] = {
                            label: cell.value,
                        };
                        break;
                    case 'IMG':
                        do {
                            cntIMG++;
                        } while (cardData['image' + cntIMG]);

                        cardData['image' + cntIMG] = {
                            resource: cell.value,
                        };
                        break;
                    case 'PGB':
                        do {
                            cntPGB++;
                        } while (cardData['progressBar' + cntPGB]);

                        cardData['progressBar' + cntPGB] = {
                            value: cell.value,
                        };
                        break;
                    default:
                        do {
                            cnt++;
                        } while (cardData['text' + cnt]);

                        cardData['text' + cnt] = cell.value;
                        break;
                }
            }
        }
        return <kup-card data={cardData} {...this.cardData}></kup-card>;
    }

    private renderRow(row: BoxRow) {
        const visibleColumns = [...this.visibleColumns];

        let boxContent = null;

        // if layout in row, use that one
        let rowLayout = row.layout;
        if (!rowLayout) {
            // otherwise, use 'default' layout
            rowLayout = this.boxLayout;
        }

        let horizontal = false;
        if (rowLayout) {
            if (rowLayout.horizontal) {
                horizontal = true;
            }

            const sections = rowLayout.sections;
            let size = sections.length;

            let cnt = 0;
            if (size > 0) {
                boxContent = [];
            }

            // create fake parent section
            const parent: Section = {
                horizontal: horizontal,
            };

            while (size-- > 0) {
                if (!this.cardData) {
                    boxContent.push(
                        this.renderSection(
                            sections[cnt++],
                            parent,
                            row,
                            visibleColumns
                        )
                    );
                } else {
                    boxContent.push(this.renderSectionAsCard(row));
                }
            }
        }

        var isSelected = false;
        for (let select of this.selectedRows) {
            if (select.id === row.id) {
                isSelected = true;
            }
        }

        let multiSel = null;
        if (this.multiSelection) {
            multiSel = (
                <div class="box-selection">
                    <kup-checkbox
                        checked={isSelected}
                        onKupCheckboxClick={(e) => e.stopPropagation()}
                    />
                </div>
            );
        }

        let rowObject = null;
        if (this.enableRowActions && !this.swipeDisabled) {
            const menuClass = {
                'row-action-menu': true,
                open: row === this.rowActionMenuOpened,
            };

            let rowActionMenuContent = null;
            if (row.actions) {
                const actionItems = row.actions.map((item, index) => {
                    const iconClass = `icon ${item.icon}`;

                    return (
                        <li
                            tabindex="0"
                            onClick={() =>
                                this.onRowActionClicked(row, item, index)
                            }
                        >
                            <div class={iconClass} />
                            <div class="text">{item.text}</div>
                        </li>
                    );
                });

                rowActionMenuContent = <ul>{actionItems}</ul>;
            }

            rowObject = (
                <div class="row-actions-wrapper">
                    <div class="row-actions-toggler">
                        <svg
                            version="1.1"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            onClick={() => this.onRowAction(row)}
                        >
                            <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                        </svg>
                        <div class={menuClass}>{rowActionMenuContent}</div>
                    </div>
                </div>
            );
        }

        let badges = null;
        if (row.badgeData && row.badgeData.length > 0) {
            badges = row.badgeData.map((badge) => (
                <kup-badge
                    text={badge.text}
                    class={
                        badge['className']
                            ? `centered ${badge['className']}`
                            : 'centered'
                    }
                    imageData={badge.imageData}
                />
            ));
        }

        let dragHandler = null;
        if (this.dragEnabled) {
            dragHandler = <span class="box-drag-handler mdi mdi-drag"></span>;
        }

        const boxClass = {
            box: true,
            draggable: this.dragEnabled,
            selected: this.showSelection && isSelected,
            column: !horizontal,
        };

        const dragHandlers: DragHandlers = {
            onDragStart: (e: DragEvent) => {
                // Sets the type of drag
                setDragEffectAllowed(e, 'move');

                if (this.multiSelection) {
                    this.addMultiSelectDragImageToEvent(e);
                }

                this.searchParentWithClass(e.target, 'box').classList.add(
                    'item-dragged'
                );
            },
            onDragEnd: (e: DragEvent) => {
                this.searchParentWithClass(e.target, 'box').classList.remove(
                    'item-dragged'
                );
            },
        };

        const dropHandlers: DropHandlers = {
            onDragOver: (e: DragEvent) => {
                this.searchParentWithClass(e.target, 'box').classList.add(
                    'item-dropover'
                );
                return true;
            },
            onDragLeave: (e: DragEvent) => {
                this.searchParentWithClass(e.target, 'box').classList.remove(
                    'item-dropover'
                );
            },
            onDrop: (e: DragEvent) => {
                this.searchParentWithClass(e.target, 'box').classList.remove(
                    'item-dropover'
                );

                return KupBoxDragType;
            },
        };

        return (
            <div class="box-wrapper">
                <div
                    class={boxClass}
                    onClick={(e) => this.onBoxClick(e, row)}
                    {...(this.dragEnabled
                        ? setKetchupDraggable(dragHandlers, {
                              [KupBoxDragType]: {
                                  fromId: this.rootElement.id,
                                  fromRow: row,
                                  fromSelectedRows: this.selectedRows,
                              },
                              'kup-drag-source-element': {
                                  fromRow: row,
                                  fromId: this.rootElement.id,
                              },
                          })
                        : {})}
                    {...(this.dropEnabled
                        ? setKetchupDroppable(
                              dropHandlers,
                              [KupBoxDragType],
                              this.rootElement,
                              { toRow: row, toId: this.rootElement.id }
                          )
                        : {})}
                >
                    {multiSel}
                    {boxContent}
                    {badges}
                    {dragHandler}
                </div>
                {rowObject}
            </div>
        );
    }

    private renderSection(
        section: Section,
        parent: Section,
        row: BoxRow,
        visibleColumns: Column[]
    ) {
        let sectionContent = null;

        if (section.sections && section.sections.length > 0) {
            // rendering child
            const sections = section.sections;
            let size = sections.length;

            let cnt = 0;
            if (size > 0) {
                sectionContent = [];
            }

            while (size-- > 0) {
                sectionContent.push(
                    this.renderSection(
                        sections[cnt++],
                        section,
                        row,
                        visibleColumns
                    )
                );
            }
        } else if (section.content) {
            // rendering box objects
            const content = section.content;
            let size = content.length;

            let cnt = 0;
            if (size > 0) {
                sectionContent = [];
            }

            while (size-- > 0) {
                sectionContent.push(
                    this.renderBoxObject({
                        boxObject: content[cnt++],
                        row,
                        visibleColumns,
                    })
                );
            }
        } else if (visibleColumns.length > 0) {
            // getting first column
            const column = visibleColumns[0];

            // removing first column
            visibleColumns.splice(0, 1);

            sectionContent = this.renderBoxObject({
                boxObject: { column: column.name },
                row,
                visibleColumns,
            });
        }

        const sectionExpanded = this.isSectionExpanded(row, section);

        const isGrid = !!section.columns;

        const sectionClass: { [index: string]: boolean } = {
            'box-section': true,
            open: sectionExpanded,
            column: !isGrid && !section.horizontal,
            grid: isGrid,
            titled: !!section.title,
            'last-child': !section.sections || section.sections.length === 0,
        };

        if (section.cssClass) {
            var classes = section.cssClass.split(' ');
            for (let index = 0; index < classes.length; index++) {
                sectionClass[classes[index]] = true;
            }
        }

        const sectionStyle: any = section.style || {};
        if (section.dim && parent) {
            sectionStyle.flex = `0 0 ${section.dim}`;

            if (parent.horizontal) {
                sectionStyle.maxWidth = section.dim;
            } else {
                sectionStyle.maxHeight = section.dim;
            }
        }

        if (isGrid) {
            sectionStyle[
                'grid-template-columns'
            ] = `repeat(${section.columns}, 1fr)`;
        }

        let sectionContainer = null;
        if (section.collapsible) {
            sectionClass['collapse-section'] = true;

            const contentClass = {
                content: true,
            };

            // TODO I18N
            let headerTitle = '';
            if (section.title) {
                headerTitle = section.title;
            } else if (sectionExpanded) {
                headerTitle = 'Chiudi';
            } else {
                headerTitle = 'Espandi';
            }

            sectionContainer = (
                <div class={sectionClass} style={sectionStyle}>
                    <div class={contentClass}>{sectionContent}</div>
                    <div
                        class="header"
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            this.toggleSectionExpand(row, section);
                        }}
                    >
                        <div class="header-content">
                            <span>{headerTitle}</span>
                            <span class="mdi mdi-chevron-down" />
                        </div>
                    </div>
                </div>
            );
        } else {
            const title = section.title ? <h3>{section.title}</h3> : null;

            sectionContainer = (
                <div class={sectionClass} style={sectionStyle}>
                    {title}
                    {sectionContent}
                </div>
            );
        }

        return sectionContainer;
    }

    private renderBoxObject({
        boxObject,
        row,
        visibleColumns,
    }: {
        boxObject: BoxObject;
        row: BoxRow;
        visibleColumns: Column[];
    }) {
        let classObj: Record<string, boolean> = {
            'box-object': true,
        };
        let boContent = null;

        let boStyle = {};
        //let boInnerHTML = null;
        let cell = null;
        let column: Column = null;
        let _hasTooltip = false;
        if (boxObject.column) {
            cell = row.cells[boxObject.column];
            column = null;
            if (cell) {
                _hasTooltip = hasTooltip(cell.obj);
                // removing column from visibleColumns
                let index = -1;

                for (let i = 0; i < visibleColumns.length; i++) {
                    const c = visibleColumns[i];

                    if (c.name === boxObject.column) {
                        index = i;
                        break;
                    }
                }

                if (index >= 0) {
                    column = visibleColumns[index];
                    visibleColumns.splice(index, 1);
                }

                if (cell.style) {
                    boStyle = { ...cell.style };
                }
                let props: any = { ...cell.data };

                if (isButton(cell.obj)) {
                    if (props) {
                        boContent = (
                            <kup-button
                                class="cell-button"
                                {...props}
                            ></kup-button>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else if (isChart(cell, boxObject)) {
                    if (props) {
                        boContent = <kup-chart class="cell-chart" {...props} />;
                    } else {
                        boContent = undefined;
                    }
                } else if (isCheckbox(cell.obj)) {
                    if (props) {
                        props['disabled'] = row;
                    } else {
                        props = { disabled: row };
                    }
                    boContent = (
                        <kup-checkbox
                            class="cell-checkbox"
                            {...props}
                        ></kup-checkbox>
                    );
                } else if (isEditor(cell, boxObject)) {
                    boContent = <kup-editor text={cell.value}></kup-editor>;
                } else if (isIcon(cell.obj)) {
                    if (props) {
                        if (!props.sizeX) {
                            props['sizeX'] = '18px';
                        }
                        if (!props.sizeY) {
                            props['sizeY'] = '18px';
                        }
                        boContent = (
                            <kup-image class="cell-icon" {...props}></kup-image>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else if (isImage(cell, boxObject)) {
                    if (props) {
                        if (!props.sizeY) {
                            props['sizeY'] = 'auto';
                        }
                        if (props.badgeData) {
                            classObj['has-padding'] = true;
                        }
                        boContent = <kup-image class="cell-image" {...props} />;
                    } else {
                        boContent = undefined;
                    }
                } else if (isPassword(cell.obj)) {
                    boContent = (
                        <kup-text-field
                            input-type="password"
                            initial-value={cell.value}
                            disabled={true}
                        ></kup-text-field>
                    );
                } else if (isProgressBar(cell, boxObject)) {
                    if (props) {
                        boContent = (
                            <kup-progress-bar
                                class="cell-progress-bar"
                                {...props}
                            ></kup-progress-bar>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else if (isRadio(cell, boxObject)) {
                    if (props) {
                        props['disabled'] = true;
                        boContent = (
                            <kup-radio
                                class="cell-radio"
                                {...props}
                            ></kup-radio>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else if (isGauge(cell, boxObject)) {
                    if (props) {
                        boContent = (
                            <kup-gauge
                                value={stringToNumber(cell.value)}
                                width-component="100%"
                                {...props}
                            ></kup-gauge>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else if (isKnob(cell, boxObject)) {
                    if (props) {
                        boContent = (
                            <kup-progress-bar
                                class="cell-progress-bar"
                                value={stringToNumber(cell.value)}
                                {...props}
                            ></kup-progress-bar>
                        );
                    } else {
                        boContent = undefined;
                    }
                } else {
                    boContent = getCellValueForDisplay(column, cell);
                }
            }
        } else if (boxObject.value) {
            // fixed value
            boContent = boxObject.value;
        }
        let title: string = undefined;
        if (_hasTooltip) {
            classObj['is-obj'] = true;
            title = cell.obj.t + '; ' + cell.obj.p + '; ' + cell.obj.k + ';';
        }
        return (
            <div
                data-column={boxObject.column}
                class={classObj}
                style={boStyle}
                title={title}
            >
                <span
                    onMouseEnter={(ev) => {
                        if (
                            _hasTooltip &&
                            this.showTooltipOnRightClick == false
                        ) {
                            this._setTooltip(ev, cell);
                        } else if (!_hasTooltip) {
                            this._unsetTooltip();
                        }
                    }}
                    onMouseLeave={() => {
                        this._unsetTooltip();
                    }}
                    onContextMenu={(ev) => {
                        ev.preventDefault();
                        if (
                            _hasTooltip &&
                            this.showTooltipOnRightClick == true
                        ) {
                            this._setTooltip(ev, cell);
                        }
                    }}
                >
                    {boContent}
                </span>
            </div>
        );
    }

    renderTooltip() {
        return (
            <kup-tooltip
                class="box-tooltip"
                loadTimeout={
                    this.showTooltipOnRightClick == true
                        ? 0
                        : this.tooltipLoadTimeout
                }
                detailTimeout={this.tooltipDetailTimeout}
                ref={(el: any) => (this.tooltip = el as KupTooltip)}
            ></kup-tooltip>
        );
    }

    render() {
        let sortPanel = null;
        if (this.sortEnabled) {
            // creating items
            const visibleColumnsItems = this.visibleColumns.map((column) => {
                const item = {
                    text: column.title,
                    value: column.name,
                    selected: column.name === this.sortBy,
                };
                return item;
            });
            const items = [{ text: '', value: '' }, ...visibleColumnsItems];
            let textfieldData = {
                label: 'Sort by',
                trailingIcon: true,
            };
            let listData = {
                data: items,
                selectable: true,
            };

            let data = {
                'kup-text-field': textfieldData,
                'kup-list': listData,
            };
            sortPanel = (
                <div id="sort-panel">
                    <kup-combobox
                        data={data}
                        initialValue={this.sortBy}
                        onKupComboboxItemClick={(e) => this.onSortChange(e)}
                    />
                </div>
            );
        }

        let filterPanel = null;
        if (this.globalFilter) {
            filterPanel = (
                <div id="global-filter">
                    <kup-text-field
                        fullWidth={true}
                        isClearable={true}
                        label="Search..."
                        icon="magnify"
                        initialValue={this.globalFilterValue}
                        onKupTextFieldInput={(event) => {
                            window.clearTimeout(this.globalFilterTimeout);
                            this.globalFilterTimeout = window.setTimeout(
                                () => this.onGlobalFilterChange(event),
                                300
                            );
                        }}
                        onKupTextFieldClearIconClick={(event) =>
                            this.onGlobalFilterChange(event)
                        }
                    ></kup-text-field>
                </div>
            );
        }

        let paginator = null;
        if (this.pagination) {
            paginator = (
                <kup-paginator
                    max={this.filteredRows.length}
                    perPage={this.pageSize}
                    currentPage={this.currentPage}
                    selectedPerPage={this.currentRowsPerPage}
                    onKupPageChanged={(e) => this.handlePageChanged(e)}
                    onKupRowsPerPageChanged={(e) =>
                        this.handleRowsPerPageChanged(e)
                    }
                    mode={PaginatorMode.SIMPLE}
                />
            );
        }

        let boxContent = null;

        if (this.rows.length === 0) {
            boxContent = <p id="empty-data-message">Empty data</p>;
        } else {
            const rows = this.rows;
            let size = rows.length;

            let cnt = 0;
            boxContent = [];

            while (size-- > 0) {
                boxContent.push(this.renderRow(rows[cnt++]));
            }
        }

        const containerStyle = {
            'grid-template-columns': `repeat(${this.columns}, 1fr)`,
        };

        const tooltip = this.renderTooltip();

        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    <div
                        class="box-component"
                        onDragOver={
                            this.dropEnabled &&
                            (this.dropOnSection || !this.getRows().length)
                                ? (e) => this.onSectionDragOver(e)
                                : null
                        }
                        onDragLeave={
                            this.dropEnabled &&
                            (this.dropOnSection || !this.getRows().length)
                                ? (e) => this.onSectionDragLeave(e)
                                : null
                        }
                    >
                        {sortPanel}
                        {filterPanel}
                        {paginator}
                        <div
                            id="box-container"
                            style={containerStyle}
                            onMouseLeave={(ev) => {
                                ev.stopPropagation();
                                this._unsetTooltip();
                            }}
                        >
                            {boxContent}
                        </div>
                        {tooltip}
                    </div>
                </div>
            </Host>
        );
    }
}
