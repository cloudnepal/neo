import Container        from '../../../../src/container/Base.mjs';
import PageSectionsList from './PageSectionsList.mjs';

/**
 * @class Portal.view.learn.PageSectionsContainer
 * @extends Neo.container.Base
 */
class PageSectionsContainer extends Container {
    static config = {
        /**
         * @member {String} className='Portal.view.learn.PageSectionsContainer'
         * @protected
         */
        className: 'Portal.view.learn.PageSectionsContainer',
        /**
         * @member {String[]} cls=['portal-page-sections-container']
         */
        cls: ['portal-page-sections-container'],
        /**
         * @member {Object[]} items
         */
        items: [{
            ntype  : 'button',
            bind   : {hidden: data => data.size === 'large'},
            cls    : ['sections-container-button'],
            handler: 'onPageSectionsToggleButtonClick',
            iconCls: 'fas fa-bars',
            ui     : 'secondary'
        }, {
            vdom:
            {cn: [
                {tag: 'h3', html: 'On this page'}
            ]}
        }, {
            module   : PageSectionsList,
            listeners: {pageListSelect: 'up.onPageListSelect'},
            reference: 'list'
        }],
        /**
         * @member {Object} layout={ntype:'vbox'}
         */
        layout: {ntype: 'vbox'}
    }

    /**
     * Convenience shortcut
     * @member {Portal.view.learn.PageSectionsList} list
     */
    get list() {
        return this.getReference('list')
    }

    /**
     * @param {Object} data
     */
    onPageListSelect(data) {
        this.toggleCls('neo-expanded', false)
    }
}

Neo.setupClass(PageSectionsContainer);

export default PageSectionsContainer;
