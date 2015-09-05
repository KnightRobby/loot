'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['bower_components/Jed/jed', 'bower_components/jed-gettext-parser/jedGettextParser'], factory);
    } else {
        // Browser globals
        root.l10n = factory(root.Jed, root.jedGettextParser);
    }
}(this, function (jed, jedGettextParser) {

    var _defaultData = {
        "messages": {
            "": {
                "domain" : "messages",
                "lang" : "en",
                "plural_forms" : "nplurals=2; plural=(n != 1);"
            }
        }
    };

    var _jed;

    return {

        _loadLocaleData: function(locale) {
            if (locale == 'en') {
                return new Promise(function(resolve, reject){
                    resolve(_defaultData);
                });
            }

            var url = 'loot://l10n/' + locale + '/LC_MESSAGES/loot.mo';

            return new Promise(function(resolve, reject){
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = 'arraybuffer';
                xhr.addEventListener('readystatechange', function(evt){
                    if (evt.target.readyState == 4) {
                        /* Status is 0 for local file URL loading. */
                        if (evt.target.status >= 200 && evt.target.status < 400) {
                            resolve(jedGettextParser.mo.parse(evt.target.response));
                        } else {
                            reject(new Error('XHR Error'));
                        }
                    }
                }, false);
                xhr.send();
            });
        },

        init: function(locale) {
            return this._loadLocaleData(locale).catch(function(error){
                    console.log(error);
                    return _defaultData;
            }).then(function(result){
                _jed = new jed({
                    'locale_data': result,
                    'domain': 'messages'
                });
            })
        },

        translate: function(text) {
            if (_jed) {
                return _jed.translate(text);
            } else {
                throw Error('l10n is uninitialised!');
            }
        },

        translateStaticText: function() {
            /* Plugin card template. */
            var pluginCard = document.querySelector('#loot-plugin-card').querySelector('template').content;

            pluginCard.querySelector('paper-tooltip[for=activeTick]').textContent = this.translate("Active Plugin").fetch();
            pluginCard.querySelector('paper-tooltip[for=isMaster]').textContent = this.translate("Master File").fetch();
            pluginCard.querySelector('paper-tooltip[for=emptyPlugin]').textContent = this.translate("Empty Plugin").fetch();
            pluginCard.querySelector('paper-tooltip[for=loadsBSA]').textContent = this.translate("Loads BSA").fetch();
            pluginCard.querySelector('paper-tooltip[for=hasUserEdits]').textContent = this.translate("Has User Metadata").fetch();

            pluginCard.getElementById('showOnlyConflicts').nextElementSibling.textContent = this.translate("Show Only Conflicts").fetch();
            pluginCard.getElementById('editMetadata').lastChild.textContent = this.translate("Edit Metadata").fetch();
            pluginCard.getElementById('copyMetadata').lastChild.textContent = this.translate("Copy Metadata").fetch();
            pluginCard.getElementById('clearMetadata').lastChild.textContent = this.translate("Clear User Metadata").fetch();

            /* Plugin editor template. */
            var pluginEditor = document.querySelector('#loot-plugin-editor').querySelector('template').content;

            pluginEditor.querySelector('paper-tooltip[for=activeTick]').textContent = this.translate("Active Plugin").fetch();
            pluginEditor.querySelector('paper-tooltip[for=isMaster]').textContent = this.translate("Master File").fetch();
            pluginEditor.querySelector('paper-tooltip[for=emptyPlugin]').textContent = this.translate("Empty Plugin").fetch();
            pluginEditor.querySelector('paper-tooltip[for=loadsBSA]').textContent = this.translate("Loads BSA").fetch();

            pluginEditor.getElementById('enableEdits').previousElementSibling.textContent = this.translate("Enable Edits").fetch();
            pluginEditor.getElementById('globalPriority').nextElementSibling.textContent = this.translate("Global priorities are compared against all other plugins. Normal priorities are compared against only conflicting plugins.").fetch();
            pluginEditor.getElementById('globalPriority').previousElementSibling.textContent = this.translate("Global Priority").fetch();
            pluginEditor.getElementById('priorityValue').previousElementSibling.textContent = this.translate("Priority Value").fetch();

            pluginEditor.getElementById('tableTabs').querySelector('[data-for=main]').textContent = this.translate("Main").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=loadAfter]').textContent = this.translate("Load After").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=req]').textContent = this.translate("Requirements").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=inc]').textContent = this.translate("Incompatibilities").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=message]').textContent = this.translate("Messages").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=tags]').textContent = this.translate("Bash Tags").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=dirty]').textContent = this.translate("Dirty Info").fetch();
            pluginEditor.getElementById('tableTabs').querySelector('[data-for=locations]').textContent = this.translate("Locations").fetch();

            pluginEditor.getElementById('loadAfter').querySelector('th:first-child').textContent = this.translate("Filename").fetch();
            pluginEditor.getElementById('loadAfter').querySelector('th:nth-child(2)').textContent = this.translate("Display Name").fetch();
            pluginEditor.getElementById('loadAfter').querySelector('th:nth-child(3)').textContent = this.translate("Condition").fetch();

            pluginEditor.getElementById('req').querySelector('th:first-child').textContent = this.translate("Filename").fetch();
            pluginEditor.getElementById('req').querySelector('th:nth-child(2)').textContent = this.translate("Display Name").fetch();
            pluginEditor.getElementById('req').querySelector('th:nth-child(3)').textContent = this.translate("Condition").fetch();

            pluginEditor.getElementById('inc').querySelector('th:first-child').textContent = this.translate("Filename").fetch();
            pluginEditor.getElementById('inc').querySelector('th:nth-child(2)').textContent = this.translate("Display Name").fetch();
            pluginEditor.getElementById('inc').querySelector('th:nth-child(3)').textContent = this.translate("Condition").fetch();

            pluginEditor.getElementById('message').querySelector('th:first-child').textContent = this.translate("Type").fetch();
            pluginEditor.getElementById('message').querySelector('th:nth-child(2)').textContent = this.translate("Content").fetch();
            pluginEditor.getElementById('message').querySelector('th:nth-child(3)').textContent = this.translate("Condition").fetch();
            pluginEditor.getElementById('message').querySelector('th:nth-child(4)').textContent = this.translate("Language").fetch();

            pluginEditor.getElementById('tags').querySelector('th:first-child').textContent = this.translate("Add/Remove").fetch();
            pluginEditor.getElementById('tags').querySelector('th:nth-child(2)').textContent = this.translate("Bash Tag").fetch();
            pluginEditor.getElementById('tags').querySelector('th:nth-child(3)').textContent = this.translate("Condition").fetch();

            pluginEditor.getElementById('dirty').querySelector('th:first-child').textContent = this.translate("CRC").fetch();
            pluginEditor.getElementById('dirty').querySelector('th:nth-child(2)').textContent = this.translate("ITM Count").fetch();
            pluginEditor.getElementById('dirty').querySelector('th:nth-child(3)').textContent = this.translate("Deleted References").fetch();
            pluginEditor.getElementById('dirty').querySelector('th:nth-child(4)').textContent = this.translate("Deleted Navmeshes").fetch();
            pluginEditor.getElementById('dirty').querySelector('th:nth-child(5)').textContent = this.translate("Cleaning Utility").fetch();

            pluginEditor.getElementById('locations').querySelector('th:first-child').textContent = this.translate("URL").fetch();
            pluginEditor.getElementById('locations').querySelector('th:nth-child(2)').textContent = this.translate("Name").fetch();

            pluginEditor.querySelector('paper-tooltip[for=accept]').textContent = this.translate("Apply").fetch();
            pluginEditor.querySelector('paper-tooltip[for=cancel]').textContent = this.translate("Cancel").fetch();

            /* Plugin List Item Template */
            var pluginItem = document.querySelector('#loot-plugin-item').querySelector('template').content;

            pluginItem.querySelector('paper-tooltip[for=globalPriorityIcon]').textContent = this.translate("Global Priority").fetch();
            pluginItem.querySelector('paper-tooltip[for=hasUserEdits]').textContent = this.translate("Has User Metadata").fetch();
            pluginItem.querySelector('paper-tooltip[for=editorIsOpen]').textContent = this.translate("Editor Is Open").fetch();

            /* File row template */
            var fileRow = document.querySelector('#fileRow').content;

            fileRow.querySelector('.name').setAttribute('error-message', this.translate("A filename is required.").fetch());
            fileRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* Message row template */
            var messageRow = document.querySelector('#messageRow').content;

            messageRow.querySelector('.type').children[0].textContent = this.translate("Note").fetch();
            messageRow.querySelector('.type').children[1].textContent = this.translate("Warning").fetch();
            messageRow.querySelector('.type').children[2].textContent = this.translate("Error").fetch();
            messageRow.querySelector('.content').setAttribute('error-message', this.translate("A content string is required.").fetch());
            messageRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* Tag row template */
            var tagRow = document.querySelector('#tagRow').content;

            tagRow.querySelector('.type').children[0].textContent = this.translate("Add").fetch();
            tagRow.querySelector('.type').children[1].textContent = this.translate("Remove").fetch();
            tagRow.querySelector('.name').setAttribute('error-message', this.translate("A name is required.").fetch());
            tagRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* Dirty Info row template */
            var dirtyInfoRow = document.querySelector('#dirtyInfoRow').content;

            dirtyInfoRow.querySelector('.crc').setAttribute('error-message', this.translate("A CRC is required.").fetch());
            dirtyInfoRow.querySelector('.itm').setAttribute('error-message', this.translate("Values must be integers.").fetch());
            dirtyInfoRow.querySelector('.udr').setAttribute('error-message', this.translate("Values must be integers.").fetch());
            dirtyInfoRow.querySelector('.nav').setAttribute('error-message', this.translate("Values must be integers.").fetch());
            dirtyInfoRow.querySelector('.util').setAttribute('error-message', this.translate("A utility name is required.").fetch());
            dirtyInfoRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* Location row template */
            var locationRow = document.querySelector('#locationRow').content;

            locationRow.querySelector('.link').setAttribute('error-message', this.translate("A link is required.").fetch());
            locationRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* Game row template */
            var gameRow = document.querySelector('#gameRow').content;

            gameRow.querySelector('.name').setAttribute('error-message', this.translate("A name is required.").fetch());
            gameRow.querySelector('.folder').setAttribute('error-message', this.translate("A folder is required.").fetch());
            gameRow.querySelector('paper-tooltip').textContent = this.translate("Delete Row").fetch();

            /* New row template */
            var newRow = document.querySelector('#newRow').content;

            newRow.querySelector('paper-tooltip').textContent = this.translate("Add New Row").fetch();

            /* Main toolbar */
            document.getElementById('mainToolbar').querySelector('paper-tooltip[for=jumpToGeneralInfo]').textContent = this.translate("Jump To General Information").fetch();
            document.getElementById('mainToolbar').querySelector('paper-tooltip[for=sortButton]').textContent = this.translate("Sort Plugins").fetch();
            document.getElementById('mainToolbar').querySelector('paper-tooltip[for=updateMasterlistButton]').textContent = this.translate("Update Masterlist").fetch();
            document.getElementById('applySortButton').textContent = this.translate("Apply").fetch();
            document.getElementById('cancelSortButton').textContent = this.translate("Cancel").fetch();
            document.getElementById('mainToolbar').querySelector('paper-tooltip[for=showSearch]').textContent = this.translate("Search Cards").fetch();

            /* Toolbar menu */
            document.getElementById('redatePluginsButton').lastChild.textContent = this.translate("Redate Plugins").fetch();
            document.getElementById('openLogButton').lastChild.textContent = this.translate("Open Debug Log Location").fetch();
            document.getElementById('wipeUserlistButton').lastChild.textContent = this.translate("Clear All User Metadata").fetch();
            document.getElementById('copyLoadOrderButton').lastChild.textContent = this.translate("Copy Load Order").fetch();
            document.getElementById('copyContentButton').lastChild.textContent = this.translate("Copy Content").fetch();
            document.getElementById('refreshContentButton').lastChild.textContent = this.translate("Refresh Content").fetch();
            document.getElementById('helpButton').lastChild.textContent = this.translate("View Documentation").fetch();
            document.getElementById('aboutButton').lastChild.textContent = this.translate("About").fetch();
            document.getElementById('settingsButton').lastChild.textContent = this.translate("Settings").fetch();
            document.getElementById('quitButton').lastChild.textContent = this.translate("Quit").fetch();

            /* Search bar */
            document.getElementById('searchBar').shadowRoot.getElementById('search').label = this.translate("Search cards").fetch();

            /* Nav items */
            document.getElementById('sidebarTabs').firstElementChild.textContent = this.translate("Plugins").fetch();
            document.getElementById('sidebarTabs').firstElementChild.nextElementSibling.textContent = this.translate("Filters").fetch();
            document.getElementById('filters').querySelector('paper-tooltip[for=contentFilter]').textContent = this.translate("Press Enter or click outside the input to set the filter.").fetch();
            document.getElementById('contentFilter').label = this.translate("Filter content").fetch();

            /* Filters */
            document.getElementById('hideVersionNumbers').textContent = this.translate("Hide version numbers").fetch();
            document.getElementById('hideCRCs').textContent = this.translate("Hide CRCs").fetch();
            document.getElementById('hideBashTags').textContent = this.translate("Hide Bash Tags").fetch();
            document.getElementById('hideNotes').textContent = this.translate("Hide notes").fetch();
            document.getElementById('hideDoNotCleanMessages').textContent = this.translate("Hide 'Do not clean' messages").fetch();
            document.getElementById('hideAllPluginMessages').textContent = this.translate("Hide all plugin messages").fetch();
            document.getElementById('hideInactivePlugins').textContent = this.translate("Hide inactive plugins").fetch();
            document.getElementById('hideMessagelessPlugins').textContent = this.translate("Hide messageless plugins").fetch();
            document.getElementById('hiddenPluginsTxt').textContent = this.translate("Hidden plugins:").fetch();
            document.getElementById('hiddenMessagesTxt').textContent = this.translate("Hidden messages:").fetch();

            /* Summary */
            document.getElementById('summary').firstElementChild.textContent = this.translate("General Information").fetch();
            document.getElementById('masterlistRevision').previousElementSibling.textContent = this.translate("Masterlist Revision").fetch();
            document.getElementById('masterlistDate').previousElementSibling.textContent = this.translate("Masterlist Date").fetch();
            document.getElementById('totalWarningNo').previousElementSibling.textContent = this.translate("Warnings").fetch();
            document.getElementById('totalErrorNo').previousElementSibling.textContent = this.translate("Errors").fetch();
            document.getElementById('totalMessageNo').previousElementSibling.textContent = this.translate("Total Messages").fetch();
            document.getElementById('activePluginNo').previousElementSibling.textContent = this.translate("Active Plugins").fetch();
            document.getElementById('dirtyPluginNo').previousElementSibling.textContent = this.translate("Dirty Plugins").fetch();
            document.getElementById('totalPluginNo').previousElementSibling.textContent = this.translate("Total Plugins").fetch();

            /* Settings dialog */
            document.getElementById('settingsDialog').querySelector('h2').textContent = this.translate("Settings").fetch();

            var defaultGameSelect = document.getElementById('defaultGameSelect');
            defaultGameSelect.previousElementSibling.textContent = this.translate("Default Game").fetch();
            defaultGameSelect.firstElementChild.textContent = this.translate("Autodetect").fetch();
            /* The selected text doesn't update, so force that translation. */
            defaultGameSelect.value = defaultGameSelect.value;
            //defaultGameSelect.shadowRoot.querySelector('paper-dropdown-menu').shadowRoot.querySelector('paper-input').value = defaultGameSelect.shadowRoot.querySelector('paper-dropdown-menu').selectedItem.textContent;

            document.getElementById('languageLabel').textContent = this.translate("Language").fetch();
            document.getElementById('languageLabel').nextElementSibling.textContent = this.translate("Language changes will be applied after LOOT is restarted.").fetch();

            document.getElementById('enableDebugLogging').previousElementSibling.textContent = this.translate("Enable debug logging").fetch();
            document.getElementById('enableDebugLogging').nextElementSibling.textContent = this.translate("The output is logged to the LOOTDebugLog.txt file.").fetch();

            document.getElementById('updateMasterlist').previousElementSibling.textContent = this.translate("Update masterlist before sorting").fetch();

            var gameTable = document.getElementById('gameTable');
            gameTable.querySelector('th:first-child').textContent = this.translate("Name").fetch();
            gameTable.querySelector('th:nth-child(2)').textContent = this.translate("Base Game").fetch();
            gameTable.querySelector('th:nth-child(3)').textContent = this.translate("LOOT Folder").fetch();
            gameTable.querySelector('th:nth-child(4)').textContent = this.translate("Master File").fetch();
            gameTable.querySelector('th:nth-child(5)').textContent = this.translate("Masterlist Repository URL").fetch();
            gameTable.querySelector('th:nth-child(6)').textContent = this.translate("Masterlist Repository Branch").fetch();
            gameTable.querySelector('th:nth-child(7)').textContent = this.translate("Install Path").fetch();
            gameTable.querySelector('th:nth-child(8)').textContent = this.translate("Install Path Registry Key").fetch();

            /* As the game table is attached on launch, its "Add New Row"
               tooltip doesn't benefit from the template translation above. */
            gameTable.querySelector('tr:last-child paper-tooltip').textContent = this.translate("Add New Row").fetch();

            document.getElementById('settingsDialog').getElementsByClassName('accept')[0].textContent = this.translate("Apply").fetch();
            document.getElementById('settingsDialog').getElementsByClassName('cancel')[0].textContent = this.translate("Cancel").fetch();

            /* First-run dialog */
            var firstRun = document.getElementById('firstRun');
            firstRun.querySelector('h2').textContent = this.translate("First-Time Tips").fetch();

            firstRun.querySelector('li:nth-child(3)').textContent = this.translate("CRCs are only displayed after plugins have been loaded, either by conflict filtering, or by sorting.").fetch();
            firstRun.querySelector('li:nth-child(4)').textContent = this.translate("Double-click a plugin in the sidebar to quickly open its metadata editor. Multiple metadata editors can be opened at once.").fetch();
            firstRun.querySelector('li:nth-child(5)').textContent = this.translate("Plugins can be drag and dropped from the sidebar into editors' \"load after, \"requirements\" and \"incompatibility\" tables.").fetch();
            firstRun.querySelector('li:nth-child(6)').textContent = this.translate("Some features are disabled while there is an editor open, or while there is a sorted load order that has not been applied or discarded.").fetch();
            firstRun.querySelector('li:last-child').textContent = this.translate("Many interface elements have tooltips. If you don't know what something is, try hovering your mouse over it to find out. Otherwise, LOOT's documentation can be accessed through the main menu.").fetch();

            firstRun.getElementsByTagName('paper-button')[0].textContent = this.translate("OK").fetch();
        },

    };
}));
