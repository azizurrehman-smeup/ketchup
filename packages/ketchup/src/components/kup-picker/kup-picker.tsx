import {
    Component,
    Event,
    EventEmitter,
    Prop,
    Element,
    Host,
    State,
    h,
    Listen,
    Method,
    Watch,
} from '@stencil/core';

import { logLoad, logRender } from '../../utils/debug-manager';
import { positionRecalc } from '../../utils/recalc-position';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import 'app-datepicker/dist/app-datepicker';
//import 'stencil-timepicker';

import {
    formattedStringToDefaultUnformattedStringDate,
    formattedStringToDefaultUnformattedStringTime,
    getCurrentLocale,
    isValidFormattedStringDate,
    isValidFormattedStringTime,
    unformattedStringToFormattedStringDate,
    unformattedStringToFormattedStringTime,
} from '../../utils/utils';
import {
    PICKER_COMPONENT_INFO,
    PICKER_SOURCE_EVENT,
    PICKER_STATUS,
} from './kup-picker-declarations';
import { nullFormat } from 'numeral';

@Component({
    tag: 'kup-picker',
    styleUrl: 'kup-picker.scss',
    shadow: true,
})
export class KupPicker {
    @Element() rootElement: HTMLElement;
    @State() customStyleTheme: string = undefined;
    @State() dateValue: string = '';
    @State() timeValue: string = '';
    /**
     * Props of the date text field.
     */
    @Prop() dateTextfieldData: Object = {};
    /**
     * The initial value of the date picker.
     */
    @Prop() dateInitialValue: string = '';
    /**
     * The minimum value of the date picker.
     */
    @Prop() dateMinValue: string = '1970-01-01';
    /**
     * The maximum value of the date picker.
     */
    @Prop() dateMaxValue: string = null;

    /**
     * Props of the time text field.
     */
    @Prop() timeTextfieldData: Object = {};
    /**
     * The initial value of the time picker.
     */
    @Prop() timeInitialValue: string = '';
    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;

    private status: PICKER_STATUS = {};

    //---- Events ----

    @Event({
        eventName: 'kupPickerBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBlur: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerChange',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupChange: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClick: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupFocus: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerInput',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupInput: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerIconClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupIconClick: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Event({
        eventName: 'kupPickerItemClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupItemClick: EventEmitter<{
        value: any;
        source: PICKER_SOURCE_EVENT;
    }>;

    @Listen('keyup', { target: 'document' })
    listenKeyup(e: KeyboardEvent) {
        let source: PICKER_SOURCE_EVENT = this.getSourceFromEvent(e);
        if (this.isPickerOpened(source)) {
            if (e.key === 'Escape') {
                this.closePicker(source);
            }
            if (e.key === 'Enter') {
                this.setPickerValueSelected(source);
            }
        }
    }

    @Listen('datepicker-value-updated', { target: 'document' })
    onKupDatePickerItemClick(e: CustomEvent) {
        this.setPickerValueSelected(PICKER_SOURCE_EVENT.DATE, e.detail.value);

        this.kupChange.emit({
            value: this.dateValue,
            source: PICKER_SOURCE_EVENT.DATE,
        });

        this.kupItemClick.emit({
            value: this.dateValue,
            source: PICKER_SOURCE_EVENT.DATE,
        });
    }

    @Watch('dateInitialValue')
    watchDateInitialValue() {
        this.dateValue = this.dateInitialValue;
        this.setTextFieldInitalValue(
            PICKER_SOURCE_EVENT.DATE,
            this.getDateForOutput()
        );
    }

    @Watch('timeInitialValue')
    watchTimeInitialValue() {
        this.timeValue = this.timeInitialValue;
        this.setTextFieldInitalValue(
            PICKER_SOURCE_EVENT.TIME,
            this.getTimeForOutput()
        );
    }
    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    onKupBlur(
        e: UIEvent & { target: HTMLInputElement },
        source: PICKER_SOURCE_EVENT
    ) {
        this.closePicker(source);
        const { target } = e;
        this.kupBlur.emit({
            value: target.value,
            source: source,
        });
    }

    onKupChange(e: CustomEvent, source: PICKER_SOURCE_EVENT) {
        this.refreshPickerValue(source, e.detail.value, this.kupChange);
    }

    onKupClick(
        e: UIEvent & { target: HTMLInputElement },
        source: PICKER_SOURCE_EVENT
    ) {
        const { target } = e;
        this.kupClick.emit({
            value: target.value,
            source: source,
        });
    }

    onKupFocus(
        e: UIEvent & { target: HTMLInputElement },
        source: PICKER_SOURCE_EVENT
    ) {
        const { target } = e;
        this.kupFocus.emit({
            value: target.value,
            source: source,
        });
    }

    onKupInput(e: CustomEvent, source: PICKER_SOURCE_EVENT) {
        this.refreshPickerValue(source, e.detail.value, this.kupInput);
    }

    onKupIconClick(
        event: UIEvent & { target: HTMLInputElement },
        source: PICKER_SOURCE_EVENT
    ) {
        const { target } = event;

        if (this.isPickerOpened(source)) {
            this.closePicker(source);
        } else {
            this.openPicker(source);
        }
        this.kupIconClick.emit({
            value: target.value,
            source: source,
        });
    }

    getSourceFromEvent(event: Event): PICKER_SOURCE_EVENT {
        // cacca
        console.log('getSourceFromEvent() event: ' + event.target);
        return PICKER_SOURCE_EVENT.DATE;
    }

    refreshPickerValue(
        source: PICKER_SOURCE_EVENT,
        eventDetailValue: string,
        eventToRaise: EventEmitter
    ) {
        let newValue = null;
        if (source == PICKER_SOURCE_EVENT.DATE) {
            if (isValidFormattedStringDate(eventDetailValue)) {
                this.dateValue = formattedStringToDefaultUnformattedStringDate(
                    eventDetailValue
                );
                newValue = this.dateValue;
            }
        }
        if (source == PICKER_SOURCE_EVENT.TIME) {
            if (isValidFormattedStringTime(eventDetailValue)) {
                this.timeValue = formattedStringToDefaultUnformattedStringTime(
                    eventDetailValue
                );
                newValue = this.timeValue;
            }
        }
        if (newValue != null) {
            this.refreshPickerComponentValue(source, newValue);
            eventToRaise.emit({
                value: newValue,
                source: source,
            });
        }
    }

    refreshPickerComponentValue(source: PICKER_SOURCE_EVENT, value: string) {
        if (!this.isPickerOpened(source)) {
            return;
        }
        this.status[source].pickerEl.value = value;
    }

    setPickerValueSelected(source: PICKER_SOURCE_EVENT, newValue?: string) {
        if (!this.isPickerOpened(source)) {
            return;
        }
        if (newValue == null) {
            newValue = this.getPickerValueSelected(source);
        }
        this.closePicker(source);
        if (newValue == null) {
            return;
        }
        if (source == PICKER_SOURCE_EVENT.DATE) {
            this.dateValue = newValue;
            this.setTextFieldInitalValue(source, this.getDateForOutput());
        }
        if (source == PICKER_SOURCE_EVENT.TIME) {
            this.timeValue = newValue;
            this.setTextFieldInitalValue(source, this.getTimeForOutput());
        }
    }

    getPickerValueSelected(source: PICKER_SOURCE_EVENT): string {
        return this.status[source].pickerEl.value;
    }

    setTextFieldInitalValue(source: PICKER_SOURCE_EVENT, value: string) {
        if (this.status[source].textfieldEl !== undefined) {
            this.status[source].textfieldEl.initialValue = value;
        }
    }

    getValueForPickerComponent(source: PICKER_SOURCE_EVENT) {
        if (source == PICKER_SOURCE_EVENT.DATE) {
            return this.dateValue;
        }
        if (source == PICKER_SOURCE_EVENT.TIME) {
            return this.timeValue;
        }
        return null;
    }

    openPicker(source: PICKER_SOURCE_EVENT) {
        let textfieldEl = this.status[source].textfieldEl;
        let containerEl = this.status[source].pickerContainerEl;
        this.status[source].pickerOpened = true;
        this.refreshPickerComponentValue(
            source,
            this.getValueForPickerComponent(source)
        );

        let textFieldWidth = null;
        if (textfieldEl != null) {
            textFieldWidth = textfieldEl.shadowRoot.querySelector(
                '.mdc-text-field'
            ).clientWidth;
            textfieldEl.classList.add('toggled');
            textfieldEl.emitSubmitEventOnEnter = false;
        }
        if (containerEl != null) {
            containerEl.classList.add('dynamic-position-active');
            containerEl.classList.add('visible');
            let elStyle: any = containerEl.style;
            elStyle.height = 'auto';
            if (textFieldWidth != null) {
                elStyle.minWidth = textFieldWidth + 'px';
            }
        }
    }

    closePicker(source: PICKER_SOURCE_EVENT) {
        let textfieldEl = this.status[source].textfieldEl;
        let containerEl = this.status[source].pickerContainerEl;
        this.status[source].pickerOpened = false;
        if (textfieldEl != null) {
            textfieldEl.classList.remove('toggled');
            textfieldEl.emitSubmitEventOnEnter = true;
        }
        if (containerEl != null) {
            containerEl.classList.remove('dynamic-position-active');
            containerEl.classList.remove('visible');
        }
    }

    isPickerOpened(source: PICKER_SOURCE_EVENT): boolean {
        return this.status[source].pickerOpened;
    }

    prepDateTextfield(): PICKER_COMPONENT_INFO {
        let ret: PICKER_COMPONENT_INFO = this.prepTextfield(
            PICKER_SOURCE_EVENT.DATE,
            this.dateTextfieldData,
            this.status[PICKER_SOURCE_EVENT.DATE].elStyle,
            this.getDateForOutput()
        );
        return ret;
    }

    prepTimeTextfield(): PICKER_COMPONENT_INFO {
        let ret: PICKER_COMPONENT_INFO = this.prepTextfield(
            PICKER_SOURCE_EVENT.TIME,
            this.timeTextfieldData,
            this.status[PICKER_SOURCE_EVENT.TIME].elStyle,
            this.getTimeForOutput()
        );
        return ret;
    }

    prepTextfield(
        source: PICKER_SOURCE_EVENT,
        textfieldData,
        elStyle,
        initialValue: string
    ): PICKER_COMPONENT_INFO {
        if (textfieldData['fullWidth']) {
            elStyle = {
                ...elStyle,
                width: '100%',
            };
        }

        if (textfieldData['fullHeight']) {
            elStyle = {
                ...elStyle,
                height: '100%',
            };
        }

        if (!textfieldData['icon']) {
            textfieldData['icon'] = 'date_range';
        }

        if (textfieldData['icon']) {
            textfieldData['trailingIcon'] = true;
        }

        let ref: PICKER_COMPONENT_INFO = { type: source };

        let comp: HTMLElement = (
            <kup-text-field
                {...textfieldData}
                style={elStyle}
                initial-value={initialValue}
                id={this.rootElement.id + '_text-field'}
                /* onKupTextFieldBlur={(e: any) => this.onKupBlur(e)} */
                onKupTextFieldChange={(e: any) => this.onKupChange(e, source)}
                onKupTextFieldClick={(e: any) => this.onKupClick(e, source)}
                onKupTextFieldFocus={(e: any) => this.onKupFocus(e, source)}
                onKupTextFieldInput={(e: any) => this.onKupInput(e, source)}
                onKupTextFieldIconClick={(e: any) =>
                    this.onKupIconClick(e, source)
                }
                ref={(el) => (this.status[source].textfieldEl = el as any)}
            ></kup-text-field>
        );

        this.status[source].elStyle = elStyle;
        ref.kupComponent = comp;
        ref.style = elStyle;
        ref.type = source;
        return ref;
    }

    prepDatePicker() {
        let comp: any = (
            <div
                id="date-picker-div"
                ref={(el) =>
                    (this.status[
                        PICKER_SOURCE_EVENT.DATE
                    ].pickerContainerEl = el as any)
                }
            >
                <app-datepicker
                    firstdayofweek="1"
                    min={this.dateMinValue}
                    max={this.dateMaxValue}
                    startview="calendar"
                    value=""
                    locale={getCurrentLocale()}
                    dragratio="0.15"
                    inline="true"
                    ref={(el) =>
                        (this.status[
                            PICKER_SOURCE_EVENT.DATE
                        ].pickerEl = el as any)
                    }
                ></app-datepicker>
            </div>
        );
        return comp;
    }

    prepTimePicker() {
        /*
        let comp: any = (
            <div
                id="time-picker-div"
                ref={(el) =>
                    (this.status[
                        PICKER_SOURCE_EVENT.TIME
                    ].pickerContainerEl = el as any)
                }
            >
                <st-timepicker
                    selected="05:00 AM"
                    class="my-class"
                    label="Choose time"
                    step="5"
                    clock24
                    ref={(el) =>
                        (this.status[
                            PICKER_SOURCE_EVENT.TIME
                        ].pickerEl = el as any)
                    }
                ></st-timepicker>
            </div>
        );
        return comp;
        */
        return null;
    }

    getDateForOutput(): string {
        if (this.dateValue == null || this.dateValue.trim() == '') {
            return '';
        }
        console.log('getDateForOutput() this.dateValue=' + this.dateValue);

        let v1 = unformattedStringToFormattedStringDate(this.dateValue);
        console.log('getDateForOutput() v1=' + v1);
        return v1;
    }

    getTimeForOutput(): string {
        if (this.timeValue == null || this.timeValue.trim() == '') {
            return '';
        }
        console.log('getTimeForOutput() this.timeValue=' + this.timeValue);

        let v1 = unformattedStringToFormattedStringTime(this.timeValue);
        console.log('getTimeForOutput() v1=' + v1);
        return v1;
    }

    recalcPosition(source: PICKER_SOURCE_EVENT) {
        if (
            this.status[source] &&
            this.status[source].pickerContainerEl != null &&
            this.status[source].textfieldEl != null
        ) {
            positionRecalc(
                this.status[source].pickerContainerEl,
                this.status[source].textfieldEl
            );
        }
    }
    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        setThemeCustomStyle(this);
        this.status[PICKER_SOURCE_EVENT.DATE] = { pickerOpened: false };
        this.status[PICKER_SOURCE_EVENT.TIME] = { pickerOpened: false };
        this.watchDateInitialValue();
        this.watchTimeInitialValue();
    }

    componentDidLoad() {
        logLoad(this, true);
    }

    componentWillRender() {
        logRender(this, false);
    }

    componentDidRender() {
        this.recalcPosition(PICKER_SOURCE_EVENT.DATE);
        this.recalcPosition(PICKER_SOURCE_EVENT.TIME);
        logRender(this, true);
    }

    render() {
        let dateTextfieldEl: PICKER_COMPONENT_INFO = this.prepDateTextfield();
        let datePickerContainerEl = this.prepDatePicker();
        let timeTextfieldEl: PICKER_COMPONENT_INFO = this.prepTimeTextfield();
        let timePickerContainerEl = this.prepTimePicker();

        let style = null;
        if (dateTextfieldEl != null && dateTextfieldEl.style != null) {
            style = {
                ...dateTextfieldEl.style,
            };
        }
        if (timeTextfieldEl != null && timeTextfieldEl.style != null) {
            style = {
                ...timeTextfieldEl.style,
            };
        }

        return (
            <Host
                onBlur={(e: any) =>
                    this.onKupBlur(e, this.getSourceFromEvent(e))
                }
                style={style}
            >
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component" style={style}>
                    {dateTextfieldEl.kupComponent}
                    {datePickerContainerEl}
                    {timeTextfieldEl.kupComponent}
                    {timePickerContainerEl}
                </div>
            </Host>
        );
    }
}
