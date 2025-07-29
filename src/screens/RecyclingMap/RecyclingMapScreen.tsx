import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { StatusHeader } from "./components/StatusHeader";
import { SearchBar } from "./components/SearchBar";
import { FilterChips } from "./components/FilterChips";
import { MapView } from "./components/MapView";
import { PointCard } from "./components/PointCard";
import { styles } from "@screens/RecyclingMap/styles/RecyclingMapStyles";
import { useRecyclingMap } from "./hooks/useRecyclingMap";

export const RecyclingMapScreen = () => {
  const {
    filteredPoints,
    selectedPoint,
    scrollViewRef,
    handlePointPress,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    handleDirections,
  } = useRecyclingMap();

  return (
    <SafeAreaView style={styles.container}>
      <StatusHeader pointCount={filteredPoints.length} />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FilterChips
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
      />
      <MapView />
      <ScrollView ref={scrollViewRef} style={styles.pointsList}>
        {filteredPoints.map((point: any) => (
          <PointCard
            key={point.id}
            point={point}
            isSelected={selectedPoint?.id === point.id}
            onPress={() => handlePointPress(point)}
            onDirectionsPress={() => handleDirections(point)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
