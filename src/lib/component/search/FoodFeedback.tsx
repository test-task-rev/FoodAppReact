import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApi } from '../../hooks/useApi';
import { API_URLS } from '../../config/api';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface FoodFeedbackProps {
  foodId: string;
  foodName: string;
}

export const FoodFeedback: React.FC<FoodFeedbackProps> = ({
  foodId,
  foodName,
}) => {
  const api = useApi(API_URLS.FOOD_SERVICE);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeedback = async (isCorrect: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/food/feedback', {
        foodId,
        foodName,
        isCorrect,
      });

      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback');
      // Still show as submitted locally even if API fails
      setFeedbackSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackSubmitted) {
    return (
      <Card style={styles.card}>
        <View style={styles.thankYou}>
          <Icon name="checkmark-circle" size={24} color={AppColors.success} />
          <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.question}>Is this information correct?</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonYes]}
          onPress={() => handleFeedback(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="thumbs-up" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Yes</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonNo]}
          onPress={() => handleFeedback(false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="thumbs-down" size={20} color="#FFF" />
              <Text style={styles.buttonText}>No</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  question: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  buttonYes: {
    backgroundColor: AppColors.success,
  },
  buttonNo: {
    backgroundColor: AppColors.error,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  thankYou: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  thankYouText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
  error: {
    fontSize: 12,
    color: AppColors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
