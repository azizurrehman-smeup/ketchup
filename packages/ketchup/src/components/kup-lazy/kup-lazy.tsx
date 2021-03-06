import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { Method } from '@stencil/core/internal';
import { setThemeCustomStyle, setCustomStyle } from '../../utils/theme-manager';
import { logLoad, logMessage, logRender } from '../../utils/debug-manager';

@Component({
    tag: 'kup-lazy',
    styleUrl: 'kup-lazy.scss',
    shadow: true,
})
export class KupLazy {
    @Element() rootElement: HTMLElement;
    @State() customStyleTheme: string = undefined;
    @State() isInViewport: boolean = false;

    /**
     * Sets the tag name of the component to be lazy loaded.
     */
    @Prop() componentName: string = undefined;
    /**
     * Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = undefined;
    /**
     * Sets the data of the component to be lazy loaded.
     */
    @Prop() data: {} = undefined;
    /**
     * Displays an animated SVG placeholder until the component is loaded.
     */
    @Prop() showPlaceholder: boolean = true;

    private intObserver: IntersectionObserver = undefined;

    //---- Methods ----

    @Method()
    async refreshCustomStyle(customStyleTheme: string) {
        this.customStyleTheme = customStyleTheme;
    }

    setObserver() {
        let callback: IntersectionObserverCallback = (
            entries: IntersectionObserverEntry[]
        ) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    logMessage(
                        this,
                        'kup-lazy entering the viewport, rendering ' +
                            this.componentName +
                            '.'
                    );
                    this.isInViewport = true;
                    this.intObserver.unobserve(this.rootElement);
                }
            });
        };
        let options: IntersectionObserverInit = {
            threshold: 0.25,
        };
        this.intObserver = new IntersectionObserver(callback, options);
    }

    //---- Lifecycle hooks ----

    componentWillLoad() {
        logLoad(this, false);
        this.setObserver();
        setThemeCustomStyle(this);
    }

    componentDidLoad() {
        this.intObserver.observe(this.rootElement);
        logLoad(this, true);
    }

    componentWillRender() {
        logRender(this, false);
    }

    componentDidRender() {
        logRender(this, true);
    }

    render() {
        let content: HTMLElement;
        let resource: HTMLElement;
        let className: string = this.componentName;
        switch (this.componentName) {
            case 'kup-button':
                //call_to_action.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M42 6H6c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h36c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4zm0 32H6v-6h36v6z" />
                    </svg>
                );
                break;
            case 'kup-card':
                //art_track.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M44 26H28v-4h16v4zm0-12H28v4h16v-4zM28 34h16v-4H28v4zm-4-16v12c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V18c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4zm-3 12l-4.5-6-3.5 4.51-2.5-3.01L7 30h14z" />
                    </svg>
                );
                break;
            case 'kup-checkbox':
                //check_box_outline_blank.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M38 10v28H10V10h28m0-4H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V10c0-2.21-1.79-4-4-4z" />
                    </svg>
                );
                break;
            case 'kup-chart':
                //chart-bar.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                    >
                        <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                    </svg>
                );
                break;
            case 'kup-data-table':
                //table-large.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4,3H20A2,2 0 0,1 22,5V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V5A2,2 0 0,1 4,3M4,7V10H8V7H4M10,7V10H14V7H10M20,10V7H16V10H20M4,12V15H8V12H4M4,20H8V17H4V20M10,12V15H14V12H10M10,20H14V17H10V20M20,20V17H16V20H20M20,12H16V15H20V12Z" />
                    </svg>
                );
                break;
            case 'kup-image':
                //photo.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M42 38V10c0-2.21-1.79-4-4-4H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4zM17 27l5 6.01L29 24l9 12H10l7-9z" />
                    </svg>
                );
                break;
            case 'kup-progress-bar':
                //linear_scale.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M39 19c-2.05 0-3.81 1.23-4.58 3h-5.84c-.77-1.77-2.53-3-4.58-3s-3.81 1.23-4.58 3h-5.84c-.77-1.77-2.53-3-4.58-3-2.77 0-5 2.23-5 5s2.23 5 5 5c2.05 0 3.81-1.23 4.58-3h5.84c.77 1.77 2.53 3 4.58 3s3.81-1.23 4.58-3h5.84c.77 1.77 2.53 3 4.58 3 2.77 0 5-2.23 5-5s-2.23-5-5-5z" />
                    </svg>
                );
                break;
            case 'kup-radio':
                //radio_button_unchecked.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
                    </svg>
                );
                break;
            default:
                //art_track.svg
                resource = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 48 48"
                    >
                        <path d="M44 26H28v-4h16v4zm0-12H28v4h16v-4zM28 34h16v-4H28v4zm-4-16v12c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V18c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4zm-3 12l-4.5-6-3.5 4.51-2.5-3.01L7 30h14z" />
                    </svg>
                );
                break;
        }
        if (this.isInViewport) {
            let Tag = this.componentName;
            content = <Tag {...this.data}></Tag>;
            className += ' loaded';
        } else if (this.showPlaceholder) {
            content = resource;
            className += ' to-be-loaded';
        }
        return (
            <Host class={className}>
                <style>{setCustomStyle(this)}</style>
                <div id="kup-component">{content}</div>
            </Host>
        );
    }

    disconnectedCallBack() {
        this.intObserver.unobserve(this.rootElement);
    }
}
