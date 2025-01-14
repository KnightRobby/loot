/*  LOOT

A load order optimisation tool for Oblivion, Skyrim, Fallout 3 and
Fallout: New Vegas.

Copyright (C) 2014-2015    WrinklyNinja

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

#ifndef LOOT_TEST_BACKEND_GAME
#define LOOT_TEST_BACKEND_GAME

#include "backend/game/game_cache.h"

#include "tests/fixtures.h"

class GameCache : public SkyrimTest {};

TEST_F(GameCache, Constructors) {
    loot::GameCache cache;
    std::unordered_set<std::string> plugins({"skyrim.esm"});

    EXPECT_NO_THROW(cache.CacheCrc("Blank.esp", 5));
    EXPECT_NO_THROW(cache.CacheCondition("True Condition", true));
    EXPECT_NO_THROW(cache.CacheActivePlugins(plugins));

    loot::GameCache cache2(cache);
    EXPECT_EQ(5, cache2.GetCachedCrc("blank.Esp"));
    EXPECT_EQ(std::make_pair(true, true), cache2.GetCachedCondition("true Condition"));
    EXPECT_TRUE(cache2.IsPluginActive("Skyrim.esm"));
}

TEST_F(GameCache, AssignmentOperator) {
    loot::GameCache cache;
    std::unordered_set<std::string> plugins({"skyrim.esm"});

    EXPECT_NO_THROW(cache.CacheCrc("Blank.esp", 5));
    EXPECT_NO_THROW(cache.CacheCondition("True Condition", true));
    EXPECT_NO_THROW(cache.CacheActivePlugins(plugins));

    loot::GameCache cache2 = cache;
    EXPECT_EQ(5, cache2.GetCachedCrc("blank.Esp"));
    EXPECT_EQ(std::make_pair(true, true), cache2.GetCachedCondition("true Condition"));
    EXPECT_TRUE(cache2.IsPluginActive("Skyrim.esm"));
}

TEST_F(GameCache, CacheCrc) {
    loot::GameCache cache;
    EXPECT_NO_THROW(cache.CacheCrc("Blank.esp", 5));
    EXPECT_EQ(5, cache.GetCachedCrc("blank.Esp"));
    EXPECT_EQ(0, cache.GetCachedCrc("Blank.missing.esp"));
}

TEST_F(GameCache, CacheCondition) {
    loot::GameCache cache;
    EXPECT_NO_THROW(cache.CacheCondition("True Condition", true));
    EXPECT_NO_THROW(cache.CacheCondition("False Condition", false));

    EXPECT_EQ(std::make_pair(true, true), cache.GetCachedCondition("true Condition"));
    EXPECT_EQ(std::make_pair(false, true), cache.GetCachedCondition("false Condition"));

    EXPECT_EQ(std::make_pair(false, false), cache.GetCachedCondition("true missing Condition"));
    EXPECT_EQ(std::make_pair(false, false), cache.GetCachedCondition("false missing Condition"));
}

TEST_F(GameCache, CacheActivePlugins) {
    loot::GameCache cache;
    std::unordered_set<std::string> plugins({
        "skyrim.esm",
        "blank.esp"
    });
    EXPECT_NO_THROW(cache.CacheActivePlugins(plugins));

    EXPECT_TRUE(cache.IsPluginActive("Skyrim.esm"));
    EXPECT_TRUE(cache.IsPluginActive("Blank.esp"));
    EXPECT_FALSE(cache.IsPluginActive("Blank.missing.esp"));
}

TEST_F(GameCache, ClearCache) {}

#endif
