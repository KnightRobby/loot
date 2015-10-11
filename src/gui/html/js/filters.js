var filters = {
    /* Filter functions return true if the given plugin passes the filter and
       should be displayed, otherwise false. */

    hiddenPluginNo: 0,
    hiddenMessageNo: 0,
    conflicts: [],

    searchFilter: function(plugin, needle) {
        if (needle.length == 0) {
            return true;
        }

        if (plugin.name.toLowerCase().indexOf(needle) != -1
            || plugin.getCrcString().toLowerCase().indexOf(needle) != -1
            || plugin.version.toLowerCase().indexOf(needle) != -1) {

            return true;
        }

        var tags = plugin.getTagStrings();
        if (tags.added.toLowerCase().indexOf(needle) != -1
            || tags.removed.toLowerCase().indexOf(needle) != -1) {

            return true;
        }

        for (var i = 0; i < plugin.messages.length; ++i) {
            if (plugin.messages[i].content[0].str.toLowerCase().indexOf(needle) != -1) {
                return true;
            }
        }
    },

    messagelessFilter: function(plugin) {
        /* This function could be further optimised to perform fewer checks,
           but it's also responsible for setting the hidden message count, so
           has to go through everything. */

        var hasMessages = false;
        /* If any messages exist, check if they are hidden or not. Note
           that the messages may not be present as elements, so the check
           is actually if they would be hidden according to the message
           filters. */
        if (this.allMessageFilter()) {
            plugin.messages.forEach(function(message){
                if (this.noteFilter(message)
                    && this.doNotCleanFilter(message)) {

                    hasMessages = true;
                    return;
                }
                ++hiddenMessageNo;
            }, this);
        } else {
            hiddenMessageNo += plugin.messages.length;
        }

        if (document.getElementById('hideMessagelessPlugins').checked) {
            return hasMessages;
        } else {
            return true;
        }
    },

    inactiveFilter: function(plugin) {
        if (document.getElementById('hideInactivePlugins').checked) {
            return plugin.isActive;
        } else {
            return true;
        }
    },

    conflictsFilter: function(plugin) {
        if (this.conflicts.length > 0) {
            return this.conflicts.indexOf(plugin.name) != -1;
        } else {
            return true;
        }
    },

    applyPluginFilters: function(plugins) {
        var search = document.getElementById('contentFilter').value.toLowerCase();
        hiddenPluginNo = 0;
        hiddenMessageNo = 0;
        var filteredPlugins = [];

        plugins.forEach(function(plugin){
            /* Messageless filter needs to run first. */
            if (this.messagelessFilter(plugin)
                && this.inactiveFilter(plugin)
                && this.conflictsFilter(plugin)
                && this.searchFilter(plugin, search)) {

                filteredPlugins.push(plugin);
                return;
            }
            ++hiddenPluginNo;
        }, this);

        document.getElementById('hiddenPluginNo').textContent = hiddenPluginNo;
        document.getElementById('hiddenMessageNo').textContent = hiddenMessageNo;

        return filteredPlugins;
    },

    /* Message filter functions are run from within plugin cards, when the card's
       messages are to be added as elements. Each filter should return true if the
       message is to be displayed. */

    noteFilter: function(message) {
        if (document.getElementById('hideNotes').checked) {
            return message.type != 'say';
        } else {
            return true;
        }
    },

    doNotCleanFilter: function(message) {
        if (document.getElementById('hideDoNotCleanMessages').checked) {
            return message.content[0].str.indexOf(l10n.translate("Do not clean").fetch()) == -1;
        } else {
            return true;
        }
    },

    allMessageFilter: function() {
        return !document.getElementById('hideAllPluginMessages').checked;
    },

    applyMessageFilters: function(messages) {
        if (this.allMessageFilter()) {
            messages.forEach(function(message){
                message.hidden = !(this.noteFilter(message) && this.doNotCleanFilter(message));
            }, this);
        }
    },
};

function getConflictingPluginsFromFilter() {
    var conflictsPlugin = document.body.getAttribute('data-conflicts');
    if (conflictsPlugin) {
        /* Now get conflicts for the plugin. */
        var request = JSON.stringify({
            name: 'getConflictingPlugins',
            args: [
                conflictsPlugin
            ]
        });

        showProgress(l10n.translate('Checking if plugins have been loaded...').fetch());

        return loot.query(request).then(JSON.parse).then(function(result){
            if (result) {
                /* Filter everything but the plugin itself if there are no
                   conflicts. */
                var conflicts = [ conflictsPlugin ];
                for (var key in result) {
                    if (result[key].conflicts) {
                        conflicts.push(key);
                    }
                    for (var i = 0; i < loot.game.plugins.length; ++i) {
                        if (loot.game.plugins[i].name == key) {
                            loot.game.plugins[i].crc = result[key].crc;
                            loot.game.plugins[i].isEmpty = result[key].isEmpty;

                            loot.game.plugins[i].messages = result[key].messages;
                            loot.game.plugins[i].tags = result[key].tags;
                            loot.game.plugins[i].isDirty = result[key].isDirty;
                            break;
                        }
                    }
                }
                closeProgressDialog();
                return conflicts;
            }
            closeProgressDialog();
            return [ conflictsPlugin ];
        }).catch(processCefError);
    }

    return Promise.resolve([]);
}

function setFilteredUIData() {
    /* The conflict filter, if enabled, executes C++ code, so needs to be
       handled using a promise, so the rest of the function should wait until
       it is completed.
    */
    getConflictingPluginsFromFilter().then(function(conflicts) {
        filters.conflicts = conflicts;
        var filtered = filters.applyPluginFilters(loot.game.plugins);
        document.getElementById('cardsNav').items = filtered;
        document.getElementById('main').lastElementChild.items = filtered;

        /* Also run message filters on the filtered plugins. */
        filtered.forEach(function(plugin){
            filters.applyMessageFilters(plugin.messages);
        });

        /* Now perform search again. If there is no current search, this won't
           do anything. */
        document.getElementById('searchBar').search();
    });
}
function restoreFilterStates() {
    if (loot.settings.filters) {
        document.getElementById('hideMessagelessPlugins').checked = loot.settings.filters.hideMessagelessPlugins;
        document.getElementById('hideInactivePlugins').checked = loot.settings.filters.hideInactivePlugins;
        document.getElementById('hideNotes').checked = loot.settings.filters.hideNotes;
        document.getElementById('hideDoNotCleanMessages').checked = loot.settings.filters.hideDoNotCleanMessages;
        document.getElementById('hideAllPluginMessages').checked = loot.settings.filters.hideAllPluginMessages;
        document.getElementById('hideVersionNumbers').checked = loot.settings.filters.hideVersionNumbers;
        document.getElementById('hideCRCs').checked = loot.settings.filters.hideCRCs;
        document.getElementById('hideBashTags').checked = loot.settings.filters.hideBashTags;
    }
}

function applyEnabledFilters() {
    if (loot.settings.filters) {
        if (loot.settings.filters.hideMessagelessPlugins
            || loot.settings.filters.hideInactivePlugins
            || loot.settings.filters.hideNotes
            || loot.settings.filters.hideDoNotCleanMessages
            || loot.settings.filters.hideAllPluginMessages) {
            setFilteredUIData();
        }

        if (loot.settings.filters.hideVersionNumbers) {
            document.getElementById('hideVersionNumbers').dispatchEvent(new Event('change'));
        }

        if (loot.settings.filters.hideCRCs) {
            document.getElementById('hideCRCs').dispatchEvent(new Event('change'));
        }

        if (loot.settings.filters.hideBashTags) {
            document.getElementById('hideBashTags').dispatchEvent(new Event('change'));
        }
    }
}
