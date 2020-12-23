import {
    Component,
    Prop,
    Element,
    Host,
    Event,
    EventEmitter,
    State,
    h,
    Watch,
    Method,
    getAssetPath,
} from '@stencil/core';
import { MDCTextField } from '@material/textfield';
import { MDCFormField } from '@material/form-field';
import { MDCTextFieldHelperText } from '@material/textfield/helper-text';
import { MDCTextFieldCharacterCounter } from '@material/textfield/character-counter';
import { MDCTextFieldIcon } from '@material/textfield/icon';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import { logLoad, logMessage, logRender } from '../../utils/debug-manager';

@Component({
    tag: 'kup-text-field',
    styleUrl: 'kup-text-field.scss',
    shadow: true,
})
export class KupTextField {
    @Element() rootElement: HTMLElement;
    @State() value: string = '';
    @State() customStyleTheme: string = undefined;

    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * Defaults at false. When set to true, the component is disabled.
     */
    @Prop() disabled: boolean = false;
    /**
     * When the text field is part of the autocomplete component and the list is opened, enter key selects the item and doesn't submit.
     */
    @Prop() emitSubmitEventOnEnter: boolean = true;
    /**
     * Defaults at false. When set to true, the component will be focused.
     */
    @Prop({ mutable: true }) forceFocus: boolean = false;
    /**
     * Defaults at false. When set to true, the component will be rendered at full width.
     */
    @Prop({ reflect: true }) fullWidth: boolean = false;
    /**
     * Defaults at null. When set, its content will be shown as a help text below the field.
     */
    @Prop() helper: string = null;
    /**
     * Defaults at false. When set, the helper will be shown only when the field is focused.
     */
    @Prop() helperWhenFocused: boolean = false;
    /**
     * Defaults at null. When set, the text-field will show this icon.
     */
    @Prop() icon: string = null;
    /**
     * Sets the initial value of the component
     */
    @Prop() initialValue: string = '';
    /**
     * The HTML type of the input element. It has no effect on text areas.
     */
    @Prop() inputType: string = 'text';
    /**
     * Enables a clear trailing icon.
     */
    @Prop() isClearable: boolean = false;
    /**
     * Defaults at null. When set, its content will be shown as a label.
     */
    @Prop() label: string = null;
    /**
     * Defaults at false. When set to true, the label will be on the left of the component.
     */
    @Prop() leadingLabel: boolean = false;
    /**
     * Defaults at null. When set, the helper will display a character counter.
     */
    @Prop() maxLength: number = null;
    /**
     * Defaults at false. When set to true, the component will be rendered as an outlined field.
     */
    @Prop() outlined: boolean = false;
    /**
     * Sets the component to read only state, making it not editable, but interactable. Used in combobox component when it behaves as a select.
     */
    @Prop() readOnly: boolean = false;
    /**
     * Defaults at false. When set to true, the component will be rendered as a textarea.
     */
    @Prop() textArea: boolean = false;
    /**
     * Defaults at null. When set, the icon will be shown after the text.
     */
    @Prop() trailingIcon: boolean = false;
    /**
     * Defaults at false. When set to true, the label will be on the right of the component.
     */
    @Prop() trailingLabel: boolean = false;

    private inputEl = undefined;

    @Event({
        eventName: 'kupTextFieldBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBlur: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldChange',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupChange: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClick: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupFocus: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldInput',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupInput: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldIconClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupIconClick: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldClearIconClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClearIconClick: EventEmitter<{
        id: any;
    }>;

    /**
     * When a keydown enter event occurs it generates
     */
    @Event({
        eventName: 'kupTextFieldSubmit',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupTextFieldSubmit: EventEmitter<{
        id: any;
        value: string;
    }>;

    @Event({
        eventName: 'kupTextFieldRendered',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupTextFieldRendered: EventEmitter<{
        id: any;
        field: KupTextField;
    }>;

    @Watch('initialValue')
    watchInitialValue() {
        this.value = this.initialValue;
        if (this.inputEl !== undefined) {
            this.inputEl.value = this.value;
        }
    }

    @Watch('emitSubmitEventOnEnter')
    watchEmitSubmitEventOnEnter() {
        // non necessario, se si vuole forzare il focus usare la prop forceFocus
        //this.inputEl.focus();
    }

    @Watch('forceFocus')
    watchForceFocus() {
        if (this.forceFocus == true) {
            this.inputEl.focus();
            this.forceFocus = false;
        }
    }

    //---- Methods ----

    @Method()
    async setFocus() {
        this.inputEl.focus();
    }

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    onKupBlur(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupBlur.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupChange(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupChange.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupClick(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupClick.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupFocus(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupFocus.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupInput(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupInput.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupIconClick(event: UIEvent & { target: HTMLInputElement }) {
        const { target } = event;
        this.kupIconClick.emit({
            id: this.rootElement.id,
            value: target.value,
        });
    }

    onKupClearIconClick() {
        this.value = '';
        this.inputEl.value = '';
        this.kupClearIconClick.emit({
            id: this.rootElement.id,
        });
    }

    /**
     * Listens for keydown events to get when 'Enter' is pressed, firing a submit event.
     */
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            if (this.emitSubmitEventOnEnter == true) {
                event.preventDefault();
                this.kupTextFieldSubmit.emit({
                    id: this.rootElement.id,
                    value: this.inputEl.value,
                });
            }
        }
    }

    /**
     * Imperatively sets a new value of the input.
     * @method changeValue
     * @param newValue - the new value to be set inside the input
     * @param emitEvent - If true, then also forces the component to emit an updated event
     */
    @Method()
    async changeValue(newValue: string, emitEvent: boolean = false) {
        if (typeof newValue === 'string') {
            if (emitEvent) {
                this.kupInput.emit({
                    id: this.rootElement.id,
                    value: newValue,
                });
            }
            this.value = newValue;
            return true;
        }
        throw new Error(`The value ${newValue} is not a valid string.`);
    }

    outlinedStyling(
        componentClass: string,
        labelEl: HTMLElement,
        placeholderLabel: string,
        iconEl: HTMLElement,
        clearIconEl: HTMLElement
    ) {
        let charEl: HTMLElement = null;
        let inputEl: HTMLElement = null;
        let leadingIconEl: HTMLElement = null;
        let trailingIconEl: HTMLElement = null;
        componentClass += '  mdc-text-field--outlined';

        if (this.icon) {
            if (this.trailingIcon) {
                trailingIconEl = iconEl;
            } else {
                leadingIconEl = iconEl;
            }
        }

        if (this.textArea) {
            componentClass += ' mdc-text-field--textarea';
            if (this.maxLength) {
                let charString = '0 / ' + this.maxLength;
                charEl = (
                    <div class="mdc-text-field-character-counter">
                        {charString}
                    </div>
                );
            }
            inputEl = (
                <span class="mdc-text-field__resizer">
                    <textarea
                        id="kup-input"
                        class="mdc-text-field__input"
                        disabled={this.disabled}
                        readOnly={this.readOnly}
                        maxlength={this.maxLength}
                        value={this.value}
                        onBlur={(e: any) => this.onKupBlur(e)}
                        onChange={(e: any) => this.onKupChange(e)}
                        onClick={(e: any) => this.onKupClick(e)}
                        onFocus={(e: any) => this.onKupFocus(e)}
                        onInput={(e: any) => this.onKupInput(e)}
                        ref={(el) => (this.inputEl = el as any)}
                    ></textarea>
                </span>
            );
        } else {
            inputEl = (
                <input
                    type={this.inputType}
                    id="kup-input"
                    class="mdc-text-field__input"
                    disabled={this.disabled}
                    readOnly={this.readOnly}
                    placeholder={placeholderLabel}
                    maxlength={this.maxLength}
                    value={this.value}
                    onBlur={(e: any) => this.onKupBlur(e)}
                    onChange={(e: any) => this.onKupChange(e)}
                    onClick={(e: any) => this.onKupClick(e)}
                    onFocus={(e: any) => this.onKupFocus(e)}
                    onInput={(e: any) => this.onKupInput(e)}
                    onKeyDown={(e: any) => this.onKeyDown(e)}
                    ref={(el) => (this.inputEl = el as any)}
                ></input>
            );
        }

        return (
            <div class={componentClass}>
                {charEl}
                {leadingIconEl}
                {inputEl}
                {clearIconEl}
                {trailingIconEl}
                <div class="mdc-notched-outline">
                    <div class="mdc-notched-outline__leading"></div>
                    <div class="mdc-notched-outline__notch">{labelEl}</div>
                    <div class="mdc-notched-outline__trailing"></div>
                </div>
            </div>
        );
    }

    defaultStyling(
        componentClass: string,
        labelEl: HTMLElement,
        placeholderLabel: string,
        iconEl: HTMLElement,
        clearIconEl: HTMLElement
    ) {
        let leadingIconEl: HTMLElement = null;
        let trailingIconEl: HTMLElement = null;

        if (this.icon) {
            if (this.trailingIcon) {
                trailingIconEl = iconEl;
            } else {
                leadingIconEl = iconEl;
            }
        }

        if (!this.fullWidth) {
            componentClass += '  mdc-text-field--filled';
        }

        return (
            <div class={componentClass}>
                {leadingIconEl}
                <input
                    type={this.inputType}
                    id="kup-input"
                    class="mdc-text-field__input"
                    disabled={this.disabled}
                    readOnly={this.readOnly}
                    placeholder={placeholderLabel}
                    maxlength={this.maxLength}
                    value={this.value}
                    onBlur={(e: any) => this.onKupBlur(e)}
                    onChange={(e: any) => this.onKupChange(e)}
                    onClick={(e: any) => this.onKupClick(e)}
                    onFocus={(e: any) => this.onKupFocus(e)}
                    onInput={(e: any) => this.onKupInput(e)}
                    onKeyDown={(e: any) => this.onKeyDown(e)}
                    ref={(el) => (this.inputEl = el as any)}
                ></input>
                {clearIconEl}
                {trailingIconEl}
                {labelEl}
                <span class="mdc-line-ripple"></span>
            </div>
        );
    }

    renderForm(widgetEl: HTMLElement, helperEl: HTMLElement) {
        let formClass: string = 'mdc-form-field';

        if (this.leadingLabel) {
            formClass += ' mdc-form-field--align-end';
        }

        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    <div class={formClass}>
                        {widgetEl}
                        {helperEl}
                        <label htmlFor="kup-input">{this.label}</label>
                    </div>
                </div>
            </Host>
        );
    }

    renderTextField(widgetEl: HTMLElement, helperEl: HTMLElement) {
        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    {widgetEl}
                    {helperEl}
                </div>
            </Host>
        );
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        setThemeCustomStyle(this);
        this.watchInitialValue();
    }

    componentDidLoad() {
        logLoad(this, true);
    }

    componentWillRender() {
        logRender(this, false);
    }

    componentDidRender() {
        const root = this.rootElement.shadowRoot;

        if (root) {
            const component = new MDCTextField(
                root.querySelector('.mdc-text-field')
            );
            if (root.querySelector('.mdc-form-field')) {
                const formField = MDCFormField.attachTo(
                    root.querySelector('.mdc-form-field')
                );
                formField.input = component;
            }
            if (root.querySelector('.mdc-text-field-helper-text')) {
                new MDCTextFieldHelperText(
                    document.querySelector('.mdc-text-field-helper-text')
                );
            }
            if (root.querySelector('.mdc-text-field-character-counter')) {
                new MDCTextFieldCharacterCounter(
                    document.querySelector('.mdc-text-field-character-counter')
                );
            }
            if (root.querySelector('.mdc-text-field-icon')) {
                new MDCTextFieldIcon(
                    document.querySelector('.mdc-text-field-icon')
                );
            }
        }

        this.kupTextFieldRendered.emit({
            id: this.rootElement.id,
            field: this,
        });
        logRender(this, true);
    }

    render() {
        let componentClass: string = 'mdc-text-field';
        let labelEl: HTMLElement = null;
        let helperEl: HTMLElement = null;
        let iconEl: HTMLElement = null;
        let clearIconEl: HTMLElement = null;
        let charEl: HTMLElement = null;
        let widgetEl: HTMLElement = null;
        let placeholderLabel: string = null;

        if (!this.label) {
            componentClass += ' mdc-text-field--no-label';
        }

        if (this.disabled) {
            componentClass += ' mdc-text-field--disabled';
        }

        if (this.fullWidth) {
            componentClass += ' mdc-text-field--fullwidth';
            placeholderLabel = this.label;
        } else if (this.label && !this.leadingLabel && !this.trailingLabel) {
            labelEl = (
                <label class="mdc-floating-label" htmlFor="kup-input">
                    {this.label}
                </label>
            );
        }

        if (this.isClearable) {
            clearIconEl = (
                <span
                    tabindex="1"
                    class="material-icons mdc-text-field__icon clear-icon icon-container clear"
                    onClick={() => this.onKupClearIconClick()}
                ></span>
            );
            componentClass += ' is-clearable';
        }

        if (this.icon) {
            let svg: string = `url('${getAssetPath(
                `./assets/svg/${this.icon}.svg`
            )}') no-repeat center`;
            let iconStyle = {
                mask: svg,
                webkitMask: svg,
            };
            iconEl = (
                <span
                    tabindex="0"
                    style={iconStyle}
                    class="material-icons mdc-text-field__icon icon-container"
                    onClick={(e: any) => this.onKupIconClick(e)}
                ></span>
            );
            if (this.trailingIcon) {
                componentClass += ' mdc-text-field--with-trailing-icon';
            } else {
                componentClass += ' mdc-text-field--with-leading-icon';
            }
        }

        if (this.helper) {
            let helperClass: string = 'mdc-text-field-helper-text';

            if (!this.helperWhenFocused) {
                helperClass += ' mdc-text-field-helper-text--persistent';
            }

            if (this.maxLength && !this.textArea) {
                let charString = '0 / ' + this.maxLength;
                charEl = (
                    <div class="mdc-text-field-character-counter">
                        {charString}
                    </div>
                );
            }

            helperEl = (
                <div class="mdc-text-field-helper-line">
                    <div class={helperClass}>{this.helper}</div>
                    {charEl}
                </div>
            );
        } else {
            if (this.maxLength && !this.textArea) {
                let charString = '0 / ' + this.maxLength;
                charEl = (
                    <div class="mdc-text-field-character-counter">
                        {charString}
                    </div>
                );
                helperEl = (
                    <div class="mdc-text-field-helper-line">{charEl}</div>
                );
            }
        }

        if (this.textArea || this.outlined) {
            widgetEl = this.outlinedStyling(
                componentClass,
                labelEl,
                placeholderLabel,
                iconEl,
                clearIconEl
            );
        } else {
            widgetEl = this.defaultStyling(
                componentClass,
                labelEl,
                placeholderLabel,
                iconEl,
                clearIconEl
            );
        }

        if (this.leadingLabel || this.trailingLabel) {
            widgetEl = this.renderForm(widgetEl, helperEl);
        } else {
            widgetEl = this.renderTextField(widgetEl, helperEl);
        }
        return widgetEl;
    }
}
