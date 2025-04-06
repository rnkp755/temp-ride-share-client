import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import debounce from 'lodash.debounce';
import API from '@/axios';
import { Route } from '@/types';

type LocationInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isSource: boolean;
  styles: any;
  colors: any;
  onSuggestionPress?: () => void;
  queryParam: string;
  containerStyle?: any;
};

const LocationInput = ({
  placeholder,
  value,
  onChange,
  isSource,
  styles,
  colors,
  onSuggestionPress,
  queryParam,
  containerStyle,
}: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce the API calls for suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(async (text) => {
      if (text.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await API.get(`/route/search?${queryParam}=${text}`);
        
        if (response.data && response.data.data) {
          const routes = response.data.data as Route[];
          // Extract unique locations from routes
          const locationSuggestions = [...new Set(routes.map((route) => isSource ? route.src : route.dest))];
          setSuggestions(locationSuggestions);
        }
      } catch (error) {
        console.error(`Error fetching ${isSource ? 'source' : 'destination'} suggestions:`, error);
        setSuggestions([]);
      }
    }, 300),
    [isSource]
  );

  // Effect to fetch suggestions whenever input changes
  useEffect(() => {
    if (value) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
    }

    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [value, debouncedFetchSuggestions]);

  const renderSuggestion = ({ item }: { item: string }) => {
    return (
      <Pressable
        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
        onPress={() => {
          onChange(item);
          setShowSuggestions(false);
          if (onSuggestionPress) {
            onSuggestionPress();
          }
        }}
      >
        <MapPin size={16} color={colors.primary} />
        <Text style={[styles.suggestionText, { color: colors.text }]}>{item}</Text>
      </Pressable>
    );
  };

  return (
    <View style={containerStyle || styles.inputContainer}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MapPin size={20} color={colors.primary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChange}
          onFocus={() => setShowSuggestions(true)}
        />
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${isSource ? 'source' : 'destination'}-${index}-${item}`}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
      )}
    </View>
  );
};


export default LocationInput;