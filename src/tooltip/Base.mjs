import Container from '../container/Base.mjs';
import Label     from '../component/Label.mjs';

let singletons = {};

/**
 * Base class for component tooltips
 * @class Neo.tooltip.Base
 * @extends Neo.container.Base
 */
class Base extends Container {
    static config = {
        /**
         * @member {String} className='Neo.tooltip.Base'
         * @protected
         */
        className: 'Neo.tooltip.Base',
        /**
         * @member {String} ntype='tooltip'
         * @protected
         */
        ntype: 'tooltip',
        /**
         * @member {String[]} baseCls=['neo-tooltip']
         */
        baseCls: ['neo-tooltip'],
        /**
         * A reference to the target component which is supposed to show this tooltip on mouseenter
         * @member {String|null} componentId_=null
         */
        componentId_: null,
        /**
         * Delegates down to a CSS selector inside the target component
         * @member {String|null} delegate=null
         */
        delegate: null,
        /**
         * The delay in ms before the tooltip gets hidden while hovering the target element.
         * Use null to disable the dismiss logic.
         * @member {Number|null} dismissDelay=10000
         */
        dismissDelay: 10000,
        /**
         * The dismissDelay task id generated by setTimeout()
         * @member {Number|null} dismissDelayTaskId=null
         * @protected
         */
        dismissDelayTaskId: null,
        /**
         * @member {Boolean} floating=true
         */
        floating: true,
        /**
         * The delay in ms before the tooltip gets shown
         * @member {Number|null} hideDelay=400
         */
        hideDelay: 400,
        /**
         * The showDelay task id generated by setTimeout()
         * @member {Number|null} hideDelayTaskId=null
         * @protected
         */
        hideDelayTaskId: null,
        /**
         * The delay in ms before the tooltip gets shown
         * @member {Number|null} showDelay=200
         */
        showDelay: 200,
        /**
         * The showDelay task id generated by setTimeout()
         * @member {Number|null} showDelayTaskId=null
         * @protected
         */
        showDelayTaskId: null,
        /**
         * True prevents the tooltip from hiding while the mouse cursor is above it
         * @member {Boolean|null} stayOnHover_=true
         */
        stayOnHover_: true,
        /**
         * Shortcut to add a label item
         * @member {String} text_=null
         */
        text_: null
    }

    /**
     * @param {String} id
     * @param {Function} callback
     * @param {Number} delay
     */
    addTimeout(id, callback, delay) {
        id += 'DelayTaskId';

        this.clearTimeout(this[id]);
        this[id] = setTimeout(callback, delay)
    }

    /**
     * Triggered after the componentId config got changed
     * @param {String} value
     * @param {String} oldValue
     * @protected
     */
    afterSetComponentId(value, oldValue) {
        if (oldValue) {
            // todo: remove the component domListeners
        }

        if (value) {
            let me = this;

            Neo.getComponent(value).addDomListeners({
                mouseenter: me.onDelegateMouseEnter,
                mouseleave: me.onDelegateMouseLeave,
                delegate  : me.delegate,
                scope     : me
            })
        }
    }

    /**
     * Triggered after the stayOnHover config got changed
     * @param {Boolean} value
     * @param {Boolean} oldValue
     * @protected
     */
    afterSetStayOnHover(value, oldValue) {
        if (oldValue) {
            // todo: remove the component domListeners
        }

        if (value) {
            let me = this;

            me.addDomListeners([
                {mouseenter: me.onMouseEnter, scope: me},
                {mouseleave: me.onMouseLeave, scope: me}
            ])
        }
    }

    /**
     * Triggered after the text config got changed
     * @param {Boolean} value
     * @param {Boolean} oldValue
     * @protected
     */
    afterSetText(value, oldValue) {
        if (value) {
            let me    = this,
                items = me.items || [],
                item  = items[0];

            if (item?.ntype === 'label') {
                item.text = value
            } else {
                me.add({
                    module: Label,
                    text  : value
                })
            }
        }
    }

    /**
     * Clears one or multiple setTimeout call(s)
     * @param {String[]|String} timers valid values: dismiss, hide, show
     */
    clearTimeout(timers) {
        if (!Array.isArray(timers)) {
            timers = [timers]
        }

        let me = this,
            id;

        timers.forEach(timer => {
            id = timer + 'DelayTaskId';

            if (me[id]) {
                clearTimeout(me[id]);
                me[id] = null
            }
        })
    }

    /**
     * @param {Neo.controller.Application} app
     * @returns {Neo.tooltip.Base}
     */
    static createSingleton(app) {
        if (!singletons[app.name]) {
            singletons[app.name] = Neo.create('Neo.tooltip.Base', {
                appName     : app.name,
                componentId : app.mainView.id,
                delegate    : this.delegateFilter,
                isShared    : true,
                resetCfg    : {},
                windowId    : app.mainView.windowId,
                listeners : {
                    // Reconfigure on over a target
                    async targetOver({ target, data }) {
                        const me = this;

                        // Revert last pointerOver config set to initial setting.
                        me.setSilent(me.resetCfg);
                        me.resetCfg = {};

                        // Use the tooltip config block that the target was configured with
                        // to reconfigure this instance, or if there was none, check the
                        // data-neo-tooltip property for a text string.
                        const config = target?._tooltip || { text : data.target.data.neoTooltip };

                        // Cache things we have to reset
                        for (const key in config) {
                            me.resetCfg[key] = me[key];
                        }
console.log(config, me.vdom);
                        // Set ourself up as the target wants
                        me.set(config)
                    }
                }
            });
        }

        return singletons[app.name]
    }

    /**
     * Instantly hides the tooltip
     */
    hide() {
        let me = this;

        me.clearTimeout(['dismiss', 'hide', 'show']);
        me.mounted && me.unmount()
    }

    /**
     * Hides the tooltip using the given hideDelay
     * @param {Object|null} data
     */
    hideDelayed(data) {
        let me = this;

        if (me.hideDelay) {
            me.addTimeout('hide', me.hide.bind(me), me.hideDelay)
        } else {
            me.hide(data)
        }
    }

    /**
     * @param {Object} data
     */
    onDelegateMouseEnter(data) {
        let me              = this,
            {currentTarget} = data;

        // If it's an internal move within the delegate, do nothing
        if (currentTarget !== me.activeTarget?.id) {
            me.activeTarget = Neo.get(currentTarget);

            // Allow listeners (eg the Tooltip singleton) which is shared between all Components
            // listens for this in order to reconfigure itself from the activeTarget.
            // So this event must be fired before the alignment is set up.
            me.fire('targetOver', {
                target : me.activeTarget,
                data
            });

            me.align.target = currentTarget;
            me.align.targetMargin = 10;

            // Still visible, just realign
            if (me.mounted) {
                me.show();
                me.alignTo()
            }
            else {
                me.showDelayed(data)
            }
        }
    }

    // Used as a delegate filter to activate on targets which have a tooltip configuration
    static delegateFilter(path) {
        for (let i = 0, { length } = path; i < length; i++) {
            if (path[i].cls.includes('neo-uses-shared-tooltip') || path[i].data['neoTooltip']) {
                return i
            }
        }
    }

    /**
     * @param {Object} data
     */
    onDelegateMouseLeave(data) {
        let me = this;

        // If it's an internal move within the delegate, do nothing
        if (data.currentTarget === me.activeTarget?.id) {
            me.fire('targetOut', {
                target : me.activeTarget,
                data
            });

            me.activeTarget = null;
            me.hideDelayed(data)
        }
    }

    /**
     * mouseenter event listener for the tooltip element
     * @param {Object} data
     */
    onMouseEnter(data) {
        let me       = this,
            targetId = data.path[0].id;

        // only use path[0] based events to ignore mouseenter & leave for child nodes
        me.id === targetId && me.clearTimeout(['dismiss', 'hide'])
    }

    /**
     * mouseleave event listener for the tooltip element
     * @param {Object} data
     */
    onMouseLeave(data) {
        let me       = this,
            targetId = data.path[0].id;

        // only use path[0] based events to ignore mouseenter & leave for child nodes
        me.id === targetId && me.hideDelayed(null)
    }

    /**
     * Instantly shows the tooltip
     * @param {Object} data
     */
    show(data) {
        let me = this;

        me.showDelayTaskId = null;

        me.clearTimeout(['hide', 'dismiss']);

        if (me.dismissDelay) {
            me.addTimeout('dismiss', me.hide.bind(me), me.dismissDelay, data)
        }

        !me.mounted && me.render(true)
    }

    /**
     * Shows the tooltip using the given showDelay
     * @param {Object} data
     */
    showDelayed(data) {
        let me = this;

        if (me.showDelay) {
            me.addTimeout('show', me.show.bind(me), me.showDelay)
        } else {
            me.show(data)
        }
    }
}

export default Neo.setupClass(Base);
