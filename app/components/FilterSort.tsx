import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Filter, ArrowUpDown, X, Calendar, Check } from 'lucide-react-native';

// Define component props
type FilterSortOptionsProps = {
  onFilterChange: (filters: { tripDate: string; transportation: string[] }) => void;
  onSortChange: (sortOption: 'Latest' | 'Oldest') => void;
  filterOptions: {
    tripDate: string;
    transportation: string[];
  };
  sortOption: 'Latest' | 'Oldest';
};

const TRANSPORTATION_OPTIONS = ["Bike", "Auto", "Car", "Bus", "Unknown"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Custom DatePicker component
const CustomDatePicker = ({ 
  selectedDate, 
  onDateChange,
  colors 
}: { 
  selectedDate: string, 
  onDateChange: (date: string) => void,
  colors: any 
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState(() => {
    // Parse the selected date if available
    if (selectedDate) {
      const [day, month, year] = selectedDate.split('-').map(Number);
      return { day, month, year };
    }
    return { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  });
  
  // Generate valid days for the current month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const applyDate = () => {
    const formattedDate = `${tempDate.day.toString().padStart(2, '0')}-${tempDate.month.toString().padStart(2, '0')}-${tempDate.year}`;
    onDateChange(formattedDate);
    setIsPickerOpen(false);
  };
  
  const clearDate = () => {
    onDateChange('');
    setIsPickerOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dateInputContainer,
          { borderColor: colors.border }
        ]}
        onPress={() => setIsPickerOpen(true)}
      >
        <Calendar size={20} color={colors.textSecondary} />
        <Text style={[styles.dateInput, { color: selectedDate ? colors.text : colors.textSecondary }]}>
          {selectedDate || "Select date"}
        </Text>
        {selectedDate && (
          <TouchableOpacity onPress={() => onDateChange('')}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPickerOpen}
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsPickerOpen(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerControls}>
              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Day</Text>
                <FlatList 
                  data={Array.from({ length: getDaysInMonth(tempDate.month, tempDate.year) }, (_, i) => i + 1)}
                  keyExtractor={item => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        tempDate.day === item && { backgroundColor: colors.primary || `${colors.primary}20` }
                      ]}
                      onPress={() => setTempDate({ ...tempDate, day: item })}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempDate.day === item ? colors.background : colors.text }
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={Math.max(0, tempDate.day - 3)}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                />
              </View>
              
              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Month</Text>
                <FlatList 
                  data={Array.from({ length: 12 }, (_, i) => i + 1)}
                  keyExtractor={item => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        tempDate.month === item && { backgroundColor: colors.primary || `${colors.primary}20` }
                      ]}
                      onPress={() => {
                        // Adjust day if it exceeds days in the new month
                        const daysInNewMonth = getDaysInMonth(item, tempDate.year);
                        const newDay = tempDate.day > daysInNewMonth ? daysInNewMonth : tempDate.day;
                        setTempDate({ ...tempDate, month: item, day: newDay });
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempDate.month === item ? colors.background : colors.text }
                      ]}>
                        {MONTHS[item - 1]}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={Math.max(0, tempDate.month - 3)}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                />
              </View>
              
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Year</Text>
                <FlatList 
                  data={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)}
                  keyExtractor={item => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        tempDate.year === item && { backgroundColor: colors.primary || `${colors.primary}20` }
                      ]}
                      onPress={() => {
                        // Adjust day if Feb 29 in non-leap year
                        if (tempDate.month === 2 && tempDate.day === 29 && !(item % 4 === 0 && (item % 100 !== 0 || item % 400 === 0))) {
                          setTempDate({ ...tempDate, year: item, day: 28 });
                        } else {
                          setTempDate({ ...tempDate, year: item });
                        }
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempDate.year === item ? colors.background : colors.text }
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={5}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                />
              </View>
            </View>
            
            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={[styles.pickerButton, styles.clearButton, { borderColor: colors.border }]}
                onPress={clearDate}
              >
                <Text style={{ color: colors.text }}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={applyDate}
              >
                <Text style={{ color: '#FFFFFF' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Make sure to export default!
export default function FilterSortOptions({
  onFilterChange,
  onSortChange,
  filterOptions,
  sortOption,
}: FilterSortOptionsProps) {
  const { colors } = useTheme();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filterOptions);

  const toggleTransportation = (option: string) => {
    setTempFilters(current => {
      const currentTransportation = [...current.transportation];
      const index = currentTransportation.indexOf(option);
      
      if (index === -1) {
        currentTransportation.push(option);
      } else {
        currentTransportation.splice(index, 1);
      }
      
      return {
        ...current,
        transportation: currentTransportation,
      };
    });
  };

  const handleDateChange = (date: string) => {
    setTempFilters({...tempFilters, tripDate: date});
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    const clearedFilters = { tripDate: '', transportation: [] };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setFilterModalVisible(false);
  };

  const toggleSortOption = () => {
    const newSortOption = sortOption === 'Latest' ? 'Oldest' : 'Latest';
    onSortChange(newSortOption);
    setIsSortOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterOptions.tripDate) count++;
    if (filterOptions.transportation.length > 0) count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <Pressable
        style={[
          styles.button,
          getActiveFiltersCount() > 0 && styles.activeButton,
          { backgroundColor: getActiveFiltersCount() > 0 ? `${colors.primary}20` : colors.card }
        ]}
        onPress={() => setFilterModalVisible(true)}
      >
        <Filter size={18} color={getActiveFiltersCount() > 0 ? colors.primary : colors.text} />
        <Text style={[
          styles.buttonText, 
          { color: getActiveFiltersCount() > 0 ? colors.primary : colors.text }
        ]}>
          Filter{getActiveFiltersCount() > 0 ? ` (${getActiveFiltersCount()})` : ''}
        </Text>
      </Pressable>

      {/* Sort Button */}
      <View>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.card }
          ]}
          onPress={() => onSortChange(sortOption === 'Latest' ? 'Oldest' : 'Latest')}
        >
          <ArrowUpDown size={18} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {sortOption}
          </Text>
        </Pressable>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Trips</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Date Filter with Custom Picker */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Trip Date</Text>
                <CustomDatePicker 
                  selectedDate={tempFilters.tripDate} 
                  onDateChange={handleDateChange}
                  colors={colors}
                />
              </View>

              {/* Transportation Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Transportation Type</Text>
                <View style={styles.transportationOptions}>
                  {TRANSPORTATION_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.transportChip,
                        {
                          backgroundColor: tempFilters.transportation.includes(option)
                            ? `${colors.primary}20`
                            : colors.card,
                          borderColor: tempFilters.transportation.includes(option)
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleTransportation(option)}
                    >
                      {tempFilters.transportation.includes(option) && (
                        <Check size={16} color={colors.primary} style={styles.checkIcon} />
                      )}
                      <Text
                        style={[
                          styles.transportChipText,
                          {
                            color: tempFilters.transportation.includes(option)
                              ? colors.primary
                              : colors.text,
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.clearButton, { borderColor: colors.border }]}
                onPress={clearFilters}
              >
                <Text style={[styles.footerButtonText, { color: colors.text }]}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.footerButton, 
                  styles.applyButton, 
                  { backgroundColor: colors.primary }
                ]}
                onPress={applyFilters}
              >
                <Text style={[styles.footerButtonText, styles.applyButtonText]}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeButton: {
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  transportationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  transportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  transportChipText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  applyButton: {
    marginLeft: 8,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#FFFFFF',
  },
  sortDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 150,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sortOptionText: {
    fontSize: 14,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  pickerModalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerControls: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  pickerList: {
    width: '100%',
  },
  pickerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    margin: 2,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
});