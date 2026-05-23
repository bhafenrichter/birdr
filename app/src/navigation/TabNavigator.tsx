import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CaptureStack from "./stacks/CaptureStack";
import CollectionStack from "./stacks/CollectionStack";
import ExploreStack from "./stacks/ExploreStack";
import ProfileStack from "./stacks/ProfileStack";
import { TabBar } from "./TabBar";

export type TabParamList = {
  Capture: undefined;
  Collection: undefined;
  Explore: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Capture"
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Capture" component={CaptureStack} />
    <Tab.Screen name="Collection" component={CollectionStack} />
    <Tab.Screen name="Explore" component={ExploreStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

export default TabNavigator;
