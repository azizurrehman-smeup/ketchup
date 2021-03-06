import {
    Component,
    Event,
    EventEmitter,
    Prop,
    Element,
    Host,
    State,
    h,
    Method,
} from '@stencil/core';
import { MDCCheckbox } from '@material/checkbox';
import { MDCFormField } from '@material/form-field';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import { logLoad, logRender } from '../../utils/debug-manager';

@Component({
    tag: 'kup-checkbox',
    styleUrl: 'kup-checkbox.scss',
    shadow: true,
})
export class KupCheckbox {
    @Element() rootElement: HTMLElement;
    @State() value: string = '';
    @State() customStyleTheme: string = undefined;

    /**
     * Defaults at false. When set to true, the component will be set to 'checked'.
     */
    @Prop() checked: boolean = false;
    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * Defaults at false. When set to true, the component is disabled.
     */
    @Prop() disabled: boolean = false;
    /**
     * Defaults at false. When set to true, the component will be set to 'indeterminate'.
     */
    @Prop() indeterminate: boolean = false;
    /**
     * Defaults at null. When specified, its content will be shown as a label.
     */
    @Prop() label: string = null;
    /**
     * Defaults at false. When set to true, the label will be on the left of the component.
     */
    @Prop() leadingLabel: boolean = false;

    @Event({
        eventName: 'kupCheckboxBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBlur: EventEmitter<{
        value: string;
        checked: boolean;
    }>;

    @Event({
        eventName: 'kupCheckboxChange',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupChange: EventEmitter<{
        value: string;
        checked: boolean;
    }>;

    @Event({
        eventName: 'kupCheckboxClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClick: EventEmitter<{
        value: string;
        checked: boolean;
    }>;

    @Event({
        eventName: 'kupCheckboxFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupFocus: EventEmitter<{
        value: string;
        checked: boolean;
    }>;

    @Event({
        eventName: 'kupCheckboxInput',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupInput: EventEmitter<{
        value: string;
        checked: boolean;
    }>;

    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    onKupBlur() {
        this.kupBlur.emit({
            value: this.value,
            checked: this.checked == true ? true : false,
        });
    }

    onKupChange() {
        if (this.indeterminate) {
            this.checked = true;
            this.indeterminate = false;
            this.value = 'indeterminate';
        } else if (this.checked) {
            this.checked = false;
            this.value = 'off';
        } else {
            this.checked = true;
            this.value = 'on';
        }
        this.kupChange.emit({
            value: this.value,
            checked: this.checked,
        });
    }

    onKupClick() {
        this.kupClick.emit({
            value: this.value,
            checked: this.checked == true ? true : false,
        });
    }

    onKupFocus() {
        this.kupFocus.emit({
            value: this.value,
            checked: this.checked == true ? true : false,
        });
    }

    onKupInput() {
        this.kupInput.emit({
            value: this.value,
            checked: this.checked == true ? true : false,
        });
    }

    private createRippleElement() {
        if (this.disabled) {
            return undefined;
        }
        return <div class="mdc-checkbox__ripple"></div>;
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        setThemeCustomStyle(this);
    }

    componentDidLoad() {
        logLoad(this, true);
    }

    componentWillRender() {
        logRender(this, false);
        if (this.checked) {
            this.value = 'on';
        } else {
            this.value = 'off';
        }
    }

    componentDidRender() {
        const root = this.rootElement.shadowRoot;

        if (root && !this.disabled) {
            const component = MDCCheckbox.attachTo(
                root.querySelector('.mdc-checkbox')
            );
            const formField = MDCFormField.attachTo(
                root.querySelector('.mdc-form-field')
            );
            formField.input = component;
        }
        logRender(this, true);
    }

    render() {
        let formClass: string = 'mdc-form-field';
        let componentClass: string = 'mdc-checkbox';
        let componentLabel: string = this.label;
        let indeterminateAttr = {};

        if (this.checked) {
            componentClass += ' mdc-checkbox--checked';
        }

        if (this.disabled) {
            componentClass += ' mdc-checkbox--disabled';
        }

        if (this.indeterminate) {
            componentClass += ' mdc-checkbox--indeterminate';
            indeterminateAttr['data-indeterminate'] = 'true';
        }

        if (this.leadingLabel) {
            formClass += ' mdc-form-field--align-end';
        }

        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    <div class={formClass}>
                        <div id="checkbox-wrapper" class={componentClass}>
                            <input
                                type="checkbox"
                                class="mdc-checkbox__native-control"
                                checked={this.checked}
                                disabled={this.disabled}
                                {...indeterminateAttr}
                                value={this.value}
                                onBlur={() => this.onKupBlur()}
                                onChange={() => this.onKupChange()}
                                onClick={() => this.onKupClick()}
                                onFocus={() => this.onKupFocus()}
                                onInput={() => this.onKupInput()}
                            />
                            <div class="mdc-checkbox__background">
                                <svg
                                    class="mdc-checkbox__checkmark"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        class="mdc-checkbox__checkmark-path"
                                        fill="none"
                                        d="M1.73,12.91 8.1,19.28 22.79,4.59"
                                    />
                                </svg>
                                <div class="mdc-checkbox__mixedmark"></div>
                            </div>
                            {this.createRippleElement()}
                        </div>
                        <label
                            htmlFor="checkbox-wrapper"
                            onClick={() => this.onKupChange()}
                        >
                            {componentLabel}
                        </label>
                    </div>
                </div>
            </Host>
        );
    }
}
