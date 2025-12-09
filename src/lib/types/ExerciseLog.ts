export interface ExerciseLog {
  logId: string;           // Required - comes from backend
  userId: string;          // Required - comes from backend
  exerciseId?: string;     // Optional exercise catalog reference
  exerciseName: string;
  duration: number;        // Duration in minutes
  calories: number;        // Calories burned
  date: Date;             // When exercise was performed
  createdAt?: Date;       // Backend timestamp
  updatedAt?: Date;       // Backend timestamp
}

// Backend response format
export interface ExerciseLogResponse {
  logId: string;
  userId: string;
  exerciseId?: string;
  exerciseName: string;
  duration: number;
  calories: number;
  date: string;            // ISO8601 string
  createdAt: string;       // ISO8601 string
  updatedAt: string;       // ISO8601 string
}
