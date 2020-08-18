import Button     from '../../src/component/Button.mjs';
import Toolbar    from '../../src/container/Toolbar.mjs';
import DemoDialog from './DemoDialog.mjs';
import Viewport   from '../../src/container/Viewport.mjs';

/**
 * @class Dialog.MainContainer
 * @extends Neo.container.Viewport
 */
class MainContainer extends Viewport {
    static getConfig() {return {
        className: 'Dialog.MainContainer',
        ntype    : 'main-container',

        autoMount: true,
        layout   : 'base',
        style    : {padding: '20px'}
    }}

    /**
     *
     * @param {Object} config
     */
    constructor(config) {
        super(config);

        let me = this;

        me.items = [{
            module: Toolbar,
            items :[{
                module : Button,
                handler: me.createDialog.bind(me),
                iconCls: 'fa fa-window-maximize',
                text   : 'Create Dialog',
            }, '->', {
                module : Button,
                handler: MainContainer.switchTheme.bind(me),
                iconCls: 'fa fa-moon',
                text   : 'Theme Dark'
            }]
        }];
    }

    /**
     *
     * @param {Object} data
     */
    createDialog(data) {
        Neo.create(DemoDialog, {
            animateTargetId: data.component.id,
            appName        : this.appName
        });
    }

    /**
     *
     * @param {Object} data
     */
    static switchTheme(data) {
        let button     = data.component,
            buttonText = 'Theme Light',
            iconCls    = 'fa fa-sun',
            oldTheme   = 'neo-theme-light',
            theme      = 'neo-theme-dark';

        if (button.text === 'Theme Light') {
            buttonText = 'Theme Dark';
            iconCls    = 'fa fa-moon';
            oldTheme   = 'neo-theme-dark';
            theme      = 'neo-theme-light';
        }

        Neo.main.DomAccess.setBodyCls({
            add   : [theme],
            remove: [oldTheme]
        });

        button.set({
            iconCls: iconCls,
            text   : buttonText
        });
    }
}

Neo.applyClassConfig(MainContainer);

export {MainContainer as default};