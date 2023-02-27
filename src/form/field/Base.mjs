import Component        from '../../component/Base.mjs';
import ComponentManager from '../../manager/Component.mjs';

/**
 * Abstract base class for form fields
 * @class Neo.form.field.Base
 * @extends Neo.component.Base
 */
class Base extends Component {
    static config = {
        /**
         * @member {String} className='Neo.form.field.Base'
         * @protected
         */
        className: 'Neo.form.field.Base',
        /**
         * @member {String} ntype='basefield'
         * @protected
         */
        ntype: 'basefield',
        /**
         * Form groups can get set on any parent component level.
         * An alternative way for using dots in field names.
         * @member {String|null} formGroup_=null
         */
        formGroup_: null,
        /**
         * @member {*} value_=null
         */
        value_: null
    }

    /**
     * Triggered after the value config got changed
     * @param {*} value
     * @param {*} oldValue
     */
    afterSetValue(value, oldValue) {
        if (oldValue !== undefined) {
            this.fireChangeEvent(value, oldValue);
        }
    }

    /**
     * Triggered when accessing the formGroup config
     * @param {String|null} value
     * @returns {String|null} parents
     * @protected
     */
    beforeGetFormGroup(value) {
        let parents = ComponentManager.getParents(this);

        console.log(parents);

        return value;
    }

    /**
     * Override this method as needed
     * @param {*} value
     * @param {*} oldValue
     */
    fireChangeEvent(value, oldValue) {
        this.fire('change', {
            component: this,
            oldValue,
            value
        });
    }

    /**
     * @returns {*}
     */
    getValue() {
        return this.value;
    }

    /**
     * @returns {Boolean}
     */
    isValid() {
        return true;
    }

    /**
     * Resets the field to a new value or null
     * @param {*} value=null
     */
    reset(value=null) {
        this.value = value;
    }

    /**
     * Checks for client-side field errors
     * @param {Boolean} silent=true
     * @returns {Boolean} Returns true in case there are no client-side errors
     */
    validate(silent=true) {
        return true;
    }
}

/**
 * The change event fires after the value config gets changed
 * @event change
 * @param {*} value
 * @param {*} oldValue
 * @returns {Object}
 */

Neo.applyClassConfig(Base);

export default Base;
