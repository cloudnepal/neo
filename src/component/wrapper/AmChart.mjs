import {default as Component} from '../Base.mjs';
import Logger                 from '../../core/Logger.mjs';

/**
 * Convenience class to render an amChart
 * Requires setting Neo.config.useAmCharts to true (or manually include the lib)
 * @class Neo.component.wrapper.AmChart
 * @extends Neo.component.Base
 */
class AmChart extends Component {
    static getConfig() {return {
        /**
         * @member {String} className='Neo.component.wrapper.AmChart'
         * @private
         */
        className: 'Neo.component.wrapper.AmChart',
        /**
         * @member {String} ntype='am-chart'
         * @private
         */
        ntype: 'am-chart',
        /**
         * See: https://www.amcharts.com/docs/v4/
         * @member {Object} chartConfig=null
         */
        chartConfig: null,
        /**
         * @member {String} chartType='XYChart'
         */
        chartType: 'XYChart',
        /**
         * It is not possible to define adapters via json, so we pass a flag to main instead
         * @member {Boolean} combineSeriesTooltip=false
         */
        combineSeriesTooltip: false,
        /**
         * Charts & maps can have different targets to apply the data to. E.g.:
         * myChart.data = data; // => ''
         * myChart.series.values[0].data = data; // => 'series.values.0'
         * Use a Neo.ns() conform syntax with dots between props
         * @member {String} dataPath=''
         */
        dataPath: '',
        /**
         * The amCharts4 resize listener slows down animations close to a freeze in case their height is 100%
         * Set this config to true in case you want to drop a chart into a fit or vbox layout without a fixed height
         * @member {Boolean} fitParentHeight=false
         */
        fitParentHeight: false,
        /**
         * am4charts, am4maps
         * @member {String} package='am4charts'
         */
        package: 'am4charts'
    }}

    /**
     *
     */
    onConstructed() {
        super.onConstructed();

        const me = this;

        if (!me.chartConfig) {
            Logger.logError('wrapper.AmChart defined without a chartConfig', me.id);
        }

        me.parseChartConfig(me.chartConfig);

        me.on('mounted', () => {
            Neo.main.AmCharts.create({
                combineSeriesTooltip: me.combineSeriesTooltip,
                config              : me.chartConfig,
                fitParentHeight     : me.fitParentHeight,
                id                  : me.id,
                package             : me.package,
                type                : me.chartType
            }).then(me.onChartMounted);
        });
    }

    /**
     * Override this method to trigger logic after the chart got mounted into the dom
     */
    onChartMounted() {

    }

    /**
     *
     * @param {Array|Object} config
     */
    parseChartConfig(config) {
        const me = this;

        if (Neo.isArray(config)) {
            config.forEach(item => {
                me.parseChartConfig(item);
            });
        } else {
            Object.entries(config).forEach(([key, value]) => {
                if (Neo.isArray(value) || Neo.isObject(value)) {
                    me.parseChartConfig(value);
                } else if (Neo.isString(value) && value.startsWith('@config:')) {
                    value = value.substr(8);

                    if (!me[value]) {
                        Logger.logError('The used @config does not exist:', value, me);
                    } else {
                        config[key] = me[value];
                    }
                }
            });
        }
    }
}

Neo.applyClassConfig(AmChart);

export {AmChart as default};