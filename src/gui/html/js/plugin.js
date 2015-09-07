/*  LOOT

    A load order optimisation tool for Oblivion, Skyrim, Fallout 3 and
    Fallout: New Vegas.

    Copyright (C) 2013-2015    WrinklyNinja

    This file is part of LOOT.

    LOOT is free software: you can redistribute
    it and/or modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    LOOT is distributed in the hope that it will
    be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with LOOT.  If not, see
    <http://www.gnu.org/licenses/>.
*/
'use strict';
/* Plugin class for managing data and UI interaction. */

class Plugin {
    constructor(obj) {
        /* Straightforward assignments. */
        this.name = obj.name;
        this.version = obj.version;
        this.isActive = obj.isActive;
        this.isEmpty = obj.isEmpty;
        this.isMaster = obj.isMaster;
        this.loadsBSA = obj.loadsBSA;

        this.masterlist = obj.masterlist;
        this.userlist = obj.userlist;

        this.modPriority = obj.modPriority;
        this.isGlobalPriority = obj.isGlobalPriority;

        this.isDirty = obj.isDirty;

        /* UI state memory. */
        this.isMenuOpen = false;
        this.isEditorOpen = false;
        this.isConflictFilterChecked = false;
        this.isSearchResult = false;
        this.versionHidden = false;
        this.crcHidden = false;
        this.tagsHidden = false;

        /* Strip name whitespace for ID. */
        this.id = this.name.replace(/\s+/g, '');

        /* Convert CRC to a string representation. */
        this.crc = this._convCrc(obj.crc);

        /* Use only the first message content string. */
        this.messages = this._convMessages(obj.messages);

        /* Convert tags to two strings. */
        this.tags = this._convTags(obj.tags);

        /* Observe for data changes. */
        Object.observe(this, this._observer);
    }

    get hasUserEdits() {
        if (this.userlist && Object.keys(this.userlist).length > 1) {
            return true;
        } else {
            return false;
        }
    }

    get priority() {
        if (!this.modPriority || this.modPriority == 0) {
            return '';
        } else {
            return this.modPriority.toString();
        }
    }

    isVisible(needle) {
        if (this.name.toLowerCase().indexOf(needle) != -1
            || !this.versionHidden && this.version.toLowerCase().indexOf(needle) != -1
            || !this.crcHidden && this.crc.toLowerCase().indexOf(needle) != -1) {
            return true;
        }
        if (!this.tagsHidden) {
            if (this.tags.added.toLowerCase().indexOf(needle) != -1 || this.tags.removed.toLowerCase().indexOf(needle) != -1) {
            return true;
            }
        }
        for (var i = 0; i < this.messages.length; ++i) {
            if (!this.messages[i].hidden && this.messages[i].content.toLowerCase().indexOf(needle) != -1) {
                return true;
            }
        }

        return false;
    }

    _convCrc(crc) {
        if (!crc || crc == 0) {
            return '';
        } else {
            /* Pad CRC string to 8 characters. */
            return ('00000000' + crc.toString(16).toUpperCase()).slice(-8);
        }
    }

    _convMessages(messages) {
        var result = [];
        if (messages) {
            messages.forEach(function(message){
                result.push({
                    type: message.type,
                    content: message.content[0].str,
                    hidden: false
                });
            });
        }
        return result;
    }

    _convTags(tags) {
        var tagsAdded = [];
        var tagsRemoved = [];

        if (tags) {
            for (var i = 0; i < tags.length; ++i) {
                if (tags[i].name[0] == '-') {
                    tagsRemoved.push(tags[i].name.substr(1));
                } else {
                    tagsAdded.push(tags[i].name);
                }
            }
        }
        /* Now make sure that the same tag doesn't appear in both arrays.
           Prefer the removed list. */
        for (var i = 0; i < tagsAdded.length; ++i) {
            for (var j = 0; j < tagsRemoved.length; ++j) {
                if (tagsRemoved[j].toLowerCase() == tagsAdded[i].toLowerCase()) {
                    /* Remove tag from the tagsAdded array. */
                    tagsAdded.splice(i, 1);
                    --i;
                }
            }
        }

        return {
            added: tagsAdded.join(', '),
            removed: tagsRemoved.join(', ')
        };
    }

    _observer(changes) {
        changes.forEach(function(change) {
            if (change.name == 'messages') {

                /* Update the message counts. */
                var oldTotal = 0;
                var newTotal = 0;
                var oldWarns = 0;
                var newWarns = 0;
                var oldErrs = 0;
                var newErrs = 0;

                if (change.oldValue) {
                    oldTotal = change.oldValue.length;

                    change.oldValue.forEach(function(message){
                        if (message.type == 'warn') {
                            ++oldWarns;
                        } else if (message.type == 'error') {
                            ++oldErrs;
                        }
                    });
                }
                if (change.object[change.name]) {
                    newTotal = change.object[change.name].length;

                    change.object[change.name].forEach(function(message){
                        if (message.type == 'warn') {
                            ++newWarns;
                        } else if (message.type == 'error') {
                            ++newErrs;
                        }
                    });
                }

                document.getElementById('filterTotalMessageNo').textContent = parseInt(document.getElementById('filterTotalMessageNo').textContent, 10) + newTotal - oldTotal;
                document.getElementById('totalMessageNo').textContent = parseInt(document.getElementById('totalMessageNo').textContent, 10) + newTotal - oldTotal;
                document.getElementById('totalWarningNo').textContent = parseInt(document.getElementById('totalWarningNo').textContent, 10) + newWarns - oldWarns;
                document.getElementById('totalErrorNo').textContent = parseInt(document.getElementById('totalErrorNo').textContent, 10) + newErrs - oldErrs;
            } else if (change.name == 'isDirty') {
                /* Update dirty counts. */
                if (change.object[change.name]) {
                    document.getElementById('dirtyPluginNo').textContent = parseInt(document.getElementById('dirtyPluginNo').textContent, 10) + 1;
                } else {
                    document.getElementById('dirtyPluginNo').textContent = parseInt(document.getElementById('dirtyPluginNo').textContent, 10) - 1;
                }
            }
        });
    }
}

function jsonToPlugin(key, value) {
    if (value !== null && value.__type === 'Plugin') {
        var p = new Plugin(value);
        return p;
    }
    return value;
}
