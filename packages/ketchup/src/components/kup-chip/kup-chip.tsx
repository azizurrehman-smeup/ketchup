import {
    Component,
    Prop,
    Element,
    Host,
    Event,
    EventEmitter,
    State,
    h,
    Method,
    getAssetPath,
} from '@stencil/core';
import { MDCChipSet } from '@material/chips';
import { ComponentChipElement } from './kup-chip-declarations';
import { logLoad, logMessage, logRender } from '../../utils/debug-manager';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';

@Component({
    tag: 'kup-chip',
    styleUrl: 'kup-chip.scss',
    shadow: true,
})
export class KupChip {
    @Element() rootElement: HTMLElement;
    @State() customStyleTheme: string = undefined;

    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * List of elements.
     */
    @Prop() data: ComponentChipElement[] = [];
    /**
     * The type of chip. Available types: input, filter, choice or empty for default.
     */
    @Prop() type: string = undefined;

    @Event({
        eventName: 'kupChipBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBlur: EventEmitter<{
        id: string;
        index: number;
        value: string;
    }>;

    @Event({
        eventName: 'kupChipClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClick: EventEmitter<{
        id: string;
        index: number;
        value: string;
    }>;

    @Event({
        eventName: 'kupChipFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupFocus: EventEmitter<{
        id: string;
        index: number;
        value: string;
    }>;

    @Event({
        eventName: 'kupChipIconClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupIconClick: EventEmitter<{
        id: string;
        index: number;
        value: string;
    }>;

    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    onKupBlur(i: number) {
        let value: string = undefined;
        if (this.data[i]) {
            value = this.data[i].value;
        }
        this.kupBlur.emit({
            id: this.rootElement.id,
            index: i,
            value: value,
        });
    }

    onKupClick(i: number) {
        let value: string = undefined;
        if (this.data[i]) {
            value = this.data[i].value;
        }
        if (this.type === 'choice') {
            for (let j = 0; j < this.data.length; j++) {
                if (j !== i && this.data[j].checked) {
                    this.data[j].checked = false;
                }
            }
        }
        if (this.type === 'choice' || this.type === 'filter') {
            if (this.data[i].checked) {
                this.data[i].checked = false;
            } else {
                this.data[i].checked = true;
            }
            let newData = [...this.data];
            this.data = newData;
        }
        this.kupClick.emit({
            id: this.rootElement.id,
            index: i,
            value: value,
        });
    }

    onKupFocus(i: number) {
        let value: string = undefined;
        if (this.data[i]) {
            value = this.data[i].value;
        }
        this.kupFocus.emit({
            id: this.rootElement.id,
            index: i,
            value: value,
        });
    }

    onKupIconClick(i: number) {
        let value: string = undefined;
        if (this.data[i]) {
            value = this.data[i].value;
        }
        this.data.splice(i, 1);
        let newData = [...this.data];
        this.data = newData;
        this.kupIconClick.emit({
            id: this.rootElement.id,
            index: i,
            value: value,
        });
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        setThemeCustomStyle(this);
    }

    componentDidLoad() {
        logLoad(this, true);
    }

    componentWillUpdate() {
        var firstCheckedFound = false;
        if (this.type === 'choice') {
            for (let j = 0; j < this.data.length; j++) {
                if (this.data[j].checked && firstCheckedFound) {
                    this.data[j].checked = false;
                    let message =
                        'Found occurence of data(' +
                        j +
                        ") to be set on 'checked' when another one was found before! Overriding to false because the type='choice' allows only 1 'checked'.";

                    logMessage(this, message, 'warning');
                }
                if (this.data[j].checked && !firstCheckedFound) {
                    firstCheckedFound = true;
                }
            }
        }
    }

    componentWillRender() {
        logRender(this, false);
    }

    componentDidRender() {
        const root = this.rootElement.shadowRoot;

        if (root != null) {
            const chipSetEl = root.querySelector('.mdc-chip-set');
            new MDCChipSet(chipSetEl);
        }
        logRender(this, true);
    }

    render() {
        let wrapperClass = 'mdc-chip-set';
        let chipList: Array<HTMLElement> = [];
        let chipEl: HTMLElement;

        if (this.type) {
            switch (this.type) {
                case 'choice':
                    wrapperClass += ' mdc-chip-set--choice';
                    break;
                case 'filter':
                    wrapperClass += ' mdc-chip-set--filter';
                    break;
                case 'input':
                    wrapperClass += ' mdc-chip-set--input';
                    break;
                default:
                    let message =
                        'The value received for prop "type" is not supported(' +
                        this.type +
                        ').';
                    logMessage(this, message, 'warning');
            }
        }
        if (this.data.length === 0) {
            let message = 'Empty data.';
            logMessage(this, message, 'warning');
        }
        for (let i = 0; i < this.data.length; i++) {
            let componentClass: string = 'mdc-chip';
            let iconEl = [];
            let iconClass =
                'icon-container material-icons mdc-chip__icon mdc-chip__icon--leading';
            let cancelIcon = undefined;

            if (this.type === 'filter' || this.type === 'choice') {
                if (this.data[i].checked) {
                    componentClass += ' mdc-chip--selected';
                    if (this.type === 'filter') {
                        iconClass += ' mdc-chip__icon--leading-hidden';
                    }
                }
            }

            if (this.data[i].icon) {
                let svg: string = `url('${getAssetPath(
                    `./assets/svg/${this.data[i].icon}.svg`
                )}') no-repeat center`;
                let iconStyle = {
                    mask: svg,
                    webkitMask: svg,
                };
                iconEl.push(<span style={iconStyle} class={iconClass}></span>);
            }

            if (this.type === 'filter') {
                iconEl.push(
                    <span class="mdc-chip__checkmark">
                        <svg
                            class="mdc-chip__checkmark-svg"
                            viewBox="-2 -3 30 30"
                        >
                            <path
                                class="mdc-chip__checkmark-path"
                                fill="none"
                                stroke="black"
                                d="M1.73,12.91 8.1,19.28 22.79,4.59"
                            />
                        </svg>
                    </span>
                );
            }

            if (this.type === 'input') {
                cancelIcon = (
                    <span role="gridcell">
                        <span
                            onClick={() => this.onKupIconClick(i)}
                            tabindex="-1"
                            class="icon-container material-icons mdc-chip__icon clear"
                        ></span>
                    </span>
                );
            }

            chipEl = (
                <div
                    class={componentClass}
                    role="row"
                    onClick={() => this.onKupClick(i)}
                >
                    <div class="mdc-chip__ripple"></div>
                    {iconEl}
                    <span role="gridcell">
                        {/* 
                            // @ts-ignore */}
                        <span
                            role="button"
                            tabindex={i}
                            class="mdc-chip__primary-action"
                            // @ts-ignore
                            value={this.data[i].value}
                            checked={this.data[i].checked}
                            onBlur={() => this.onKupBlur(i)}
                            onFocus={() => this.onKupFocus(i)}
                        >
                            <span class="mdc-chip__text">
                                {this.data[i].label}
                            </span>
                        </span>
                    </span>
                    {cancelIcon}
                </div>
            );
            chipList.push(chipEl);
        }

        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    <div class={wrapperClass} role="grid">
                        {chipList}
                    </div>
                </div>
            </Host>
        );
    }
}
