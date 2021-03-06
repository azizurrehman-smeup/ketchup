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

import { MDCTabBar } from '@material/tab-bar';
import { ComponentTabBarElement } from './kup-tab-bar-declarations';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import { logLoad, logMessage, logRender } from '../../utils/debug-manager';

@Component({
    tag: 'kup-tab-bar',
    styleUrl: 'kup-tab-bar.scss',
    shadow: true,
})
export class KupTabBar {
    @Element() rootElement: HTMLElement;
    @State() customStyleTheme: string = undefined;

    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * List of elements.
     */
    @Prop() data: ComponentTabBarElement[] = [];

    @Event({
        eventName: 'kupTabBarBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupBlur: EventEmitter<{
        index: number;
        el: EventTarget;
    }>;

    @Event({
        eventName: 'kupTabBarClick',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupClick: EventEmitter<{
        index: number;
        el: EventTarget;
    }>;

    @Event({
        eventName: 'kupTabBarFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupFocus: EventEmitter<{
        index: number;
        el: EventTarget;
    }>;

    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    onKupBlur(i: number, e: Event) {
        this.kupBlur.emit({
            index: i,
            el: e.target,
        });
    }

    onKupClick(i: number, e: Event) {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i].active = false;
        }
        this.data[i].active = true;

        this.kupClick.emit({
            index: i,
            el: e.target,
        });
    }

    onKupFocus(i: number, e: Event) {
        this.kupFocus.emit({
            index: i,
            el: e.target,
        });
    }

    private consistencyCheck() {
        let activeTabs: number = 0;
        let lastActiveOccurrence: number = 0;
        if (this.data) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].active) {
                    activeTabs++;
                    lastActiveOccurrence = i;
                }
                this.data[i].active = false;
            }
            if (activeTabs > 1) {
                this.data[lastActiveOccurrence].active = true;
                let message = 'Too many active tabs, forcing last one.';
                logMessage(this, message, 'warning');
            } else if (activeTabs === 0) {
                this.data[0].active = true;
                let message = 'No active tabs detected, forcing first one.';
                logMessage(this, message, 'log');
            } else {
                this.data[lastActiveOccurrence].active = true;
            }
        }
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        this.consistencyCheck();
        setThemeCustomStyle(this);
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
            MDCTabBar.attachTo(root.querySelector('.mdc-tab-bar'));
        }
        logRender(this, true);
    }

    render() {
        if (!this.data || this.data.length === 0) {
            let message = 'Empty data.';
            logMessage(this, message, 'warning');
        }
        let tabBar: Array<HTMLElement> = [];
        let tabEl: HTMLElement;
        let title: string = '';
        let componentClass: string = 'mdc-tab-bar';

        for (let i = 0; i < this.data.length; i++) {
            let tabClass: string = 'mdc-tab';
            let indicatorClass: string = 'mdc-tab-indicator';
            let iconEl: HTMLElement = null;

            if (this.data[i].active) {
                tabClass += ' mdc-tab--active';
                indicatorClass += ' mdc-tab-indicator--active';
            }

            if (this.data[i].icon) {
                let svg: string = `url('${getAssetPath(
                    `./assets/svg/${this.data[i].icon}.svg`
                )}') no-repeat center`;
                let iconStyle = {
                    mask: svg,
                    webkitMask: svg,
                };
                iconEl = (
                    <span
                        style={iconStyle}
                        class="mdc-tab__icon material-icons icon-container"
                    ></span>
                );
            }

            if (this.data[i].title) {
                title = this.data[i].title;
            }

            tabEl = (
                <button
                    class={tabClass}
                    role="tab"
                    aria-selected="true"
                    tabindex={i}
                    title={title}
                    onBlur={(e) => this.onKupBlur(i, e)}
                    onClick={(e) => this.onKupClick(i, e)}
                    onFocus={(e) => this.onKupFocus(i, e)}
                >
                    <span class="mdc-tab__content">
                        {iconEl}
                        <span class="mdc-tab__text-label">
                            {this.data[i].text}
                        </span>
                    </span>
                    <span class={indicatorClass}>
                        <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                    </span>
                    <span class="mdc-tab__ripple"></span>
                </button>
            );
            tabBar.push(tabEl);
        }

        return (
            <Host>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">
                    <div class={componentClass} role="tablist">
                        <div class="mdc-tab-scroller">
                            <div class="mdc-tab-scroller__scroll-area">
                                <div class="mdc-tab-scroller__scroll-content">
                                    {tabBar}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Host>
        );
    }
}
