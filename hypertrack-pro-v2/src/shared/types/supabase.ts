/* eslint-disable */
// Generated via Supabase MCP

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      custom_field_values: {
        Row: { created_at: string | null; custom_field_id: number | null; entity_id: number; id: number; value: Json }
        Insert: { created_at?: string | null; custom_field_id?: number | null; entity_id: number; id?: number; value: Json }
        Update: { created_at?: string | null; custom_field_id?: number | null; entity_id?: number; id?: number; value?: Json }
        Relationships: [
          { foreignKeyName: "custom_field_values_custom_field_id_fkey"; columns: ["custom_field_id"]; isOneToOne: false; referencedRelation: "custom_fields"; referencedColumns: ["id"] },
        ]
      }
      custom_fields: {
        Row: { created_at: string | null; entity_type: string; field_config: Json | null; field_name: string; field_type: string; id: number; is_active: boolean | null; user_id: string | null }
        Insert: { created_at?: string | null; entity_type: string; field_config?: Json | null; field_name: string; field_type: string; id?: number; is_active?: boolean | null; user_id?: string | null }
        Update: { created_at?: string | null; entity_type?: string; field_config?: Json | null; field_name?: string; field_type?: string; id?: number; is_active?: boolean | null; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "custom_fields_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      exercises: {
        Row: { category: string; created_at: string | null; description: string | null; equipment: Json | null; id: number; instructions: Json | null; is_active: boolean | null; mechanics: Json | null; muscle_group: string; mvc_percentage: number; name: string; research_data: Json | null; tier: number; updated_at: string | null }
        Insert: { category: string; created_at?: string | null; description?: string | null; equipment?: Json | null; id?: number; instructions?: Json | null; is_active?: boolean | null; mechanics?: Json | null; muscle_group: string; mvc_percentage: number; name: string; research_data?: Json | null; tier: number; updated_at?: string | null }
        Update: { category?: string; created_at?: string | null; description?: string | null; equipment?: Json | null; id?: number; instructions?: Json | null; is_active?: boolean | null; mechanics?: Json | null; muscle_group?: string; mvc_percentage?: number; name?: string; research_data?: Json | null; tier?: number; updated_at?: string | null }
        Relationships: []
      }
      mcp_dummy: {
        Row: { created_at: string; id: string; note: string | null }
        Insert: { created_at?: string; id?: string; note?: string | null }
        Update: { created_at?: string; id?: string; note?: string | null }
        Relationships: []
      }
      personal_records: {
        Row: { achieved_date: string; created_at: string | null; exercise_id: number | null; id: number; record_data: Json | null; record_type: string; secondary_value: number | null; user_id: string | null; value: number; workout_id: number | null }
        Insert: { achieved_date: string; created_at?: string | null; exercise_id?: number | null; id?: number; record_data?: Json | null; record_type: string; secondary_value?: number | null; user_id?: string | null; value: number; workout_id?: number | null }
        Update: { achieved_date?: string; created_at?: string | null; exercise_id?: number | null; id?: number; record_data?: Json | null; record_type?: string; secondary_value?: number | null; user_id?: string | null; value?: number; workout_id?: number | null }
        Relationships: [
          { foreignKeyName: "personal_records_exercise_id_fkey"; columns: ["exercise_id"]; isOneToOne: false; referencedRelation: "exercises"; referencedColumns: ["id"] },
          { foreignKeyName: "personal_records_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "personal_records_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workout_summary"; referencedColumns: ["id"] },
          { foreignKeyName: "personal_records_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workouts"; referencedColumns: ["id"] },
        ]
      }
      progression_targets: {
        Row: { created_at: string | null; current_reps: number | null; current_sets: number | null; current_weight: number | null; exercise_id: number | null; id: number; last_updated: string | null; next_reps: number | null; next_sets: number | null; next_weight: number | null; progression_method: string | null; progression_rate: number | null; user_id: string | null }
        Insert: { created_at?: string | null; current_reps?: number | null; current_sets?: number | null; current_weight?: number | null; exercise_id?: number | null; id?: number; last_updated?: string | null; next_reps?: number | null; next_sets?: number | null; next_weight?: number | null; progression_method?: string | null; progression_rate?: number | null; user_id?: string | null }
        Update: { created_at?: string | null; current_reps?: number | null; current_sets?: number | null; current_weight?: number | null; exercise_id?: number | null; id?: number; last_updated?: string | null; next_reps?: number | null; next_sets?: number | null; next_weight?: number | null; progression_method?: string | null; progression_rate?: number | null; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "progression_targets_exercise_id_fkey"; columns: ["exercise_id"]; isOneToOne: false; referencedRelation: "exercises"; referencedColumns: ["id"] },
          { foreignKeyName: "progression_targets_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      sets: {
        Row: { created_at: string | null; id: number; is_failure: boolean | null; is_warmup: boolean | null; metrics: Json | null; notes: string | null; range_of_motion: string | null; reps: number; rest_time_actual: number | null; rpe: number | null; set_number: number; tempo: string | null; weight: number; workout_exercise_id: number | null }
        Insert: { created_at?: string | null; id?: number; is_failure?: boolean | null; is_warmup?: boolean | null; metrics?: Json | null; notes?: string | null; range_of_motion?: string | null; reps: number; rest_time_actual?: number | null; rpe?: number | null; set_number: number; tempo?: string | null; weight: number; workout_exercise_id?: number | null }
        Update: { created_at?: string | null; id?: number; is_failure?: boolean | null; is_warmup?: boolean | null; metrics?: Json | null; notes?: string | null; range_of_motion?: string | null; reps?: number; rest_time_actual?: number | null; rpe?: number | null; set_number?: number; tempo?: string | null; weight?: number; workout_exercise_id?: number | null }
        Relationships: [
          { foreignKeyName: "sets_workout_exercise_id_fkey"; columns: ["workout_exercise_id"]; isOneToOne: false; referencedRelation: "workout_exercises"; referencedColumns: ["id"] },
        ]
      }
      users: {
        Row: { created_at: string | null; email: string; id: string; preferences: Json | null; profile_data: Json | null; updated_at: string | null; username: string | null }
        Insert: { created_at?: string | null; email: string; id?: string; preferences?: Json | null; profile_data?: Json | null; updated_at?: string | null; username?: string | null }
        Update: { created_at?: string | null; email?: string; id?: string; preferences?: Json | null; profile_data?: Json | null; updated_at?: string | null; username?: string | null }
        Relationships: []
      }
      workout_exercises: {
        Row: { created_at: string | null; exercise_id: number | null; exercise_order: number; id: number; parameters: Json | null; rest_time_seconds: number | null; target_reps_max: number | null; target_reps_min: number | null; target_sets: number | null; target_weight: number | null; workout_id: number | null }
        Insert: { created_at?: string | null; exercise_id?: number | null; exercise_order: number; id?: number; parameters?: Json | null; rest_time_seconds?: number | null; target_reps_max?: number | null; target_reps_min?: number | null; target_sets?: number | null; target_weight?: number | null; workout_id?: number | null }
        Update: { created_at?: string | null; exercise_id?: number | null; exercise_order?: number; id?: number; parameters?: Json | null; rest_time_seconds?: number | null; target_reps_max?: number | null; target_reps_min?: number | null; target_sets?: number | null; target_weight?: number | null; workout_id?: number | null }
        Relationships: [
          { foreignKeyName: "workout_exercises_exercise_id_fkey"; columns: ["exercise_id"]; isOneToOne: false; referencedRelation: "exercises"; referencedColumns: ["id"] },
          { foreignKeyName: "workout_exercises_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workout_summary"; referencedColumns: ["id"] },
          { foreignKeyName: "workout_exercises_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workouts"; referencedColumns: ["id"] },
        ]
      }
      workouts: {
        Row: { created_at: string | null; end_time: string | null; id: number; metadata: Json | null; notes: string | null; start_time: string; tags: Json | null; total_sets: number | null; total_volume: number | null; user_id: string | null; workout_date: string }
        Insert: { created_at?: string | null; end_time?: string | null; id?: number; metadata?: Json | null; notes?: string | null; start_time: string; tags?: Json | null; total_sets?: number | null; total_volume?: number | null; user_id?: string | null; workout_date: string }
        Update: { created_at?: string | null; end_time?: string | null; id?: number; metadata?: Json | null; notes?: string | null; start_time?: string; tags?: Json | null; total_sets?: number | null; total_volume?: number | null; user_id?: string | null; workout_date?: string }
        Relationships: [
          { foreignKeyName: "workouts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: {
      exercise_performance: {
        Row: { avg_rpe: number | null; exercise_id: number | null; exercise_name: string | null; max_weight: number | null; muscle_group: string | null; total_sets: number | null; total_volume: number | null; user_id: string | null; workout_date: string | null; workout_exercise_id: number | null; workout_id: number | null }
        Relationships: [
          { foreignKeyName: "sets_workout_exercise_id_fkey"; columns: ["workout_exercise_id"]; isOneToOne: false; referencedRelation: "workout_exercises"; referencedColumns: ["id"] },
          { foreignKeyName: "workout_exercises_exercise_id_fkey"; columns: ["exercise_id"]; isOneToOne: false; referencedRelation: "exercises"; referencedColumns: ["id"] },
          { foreignKeyName: "workout_exercises_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workout_summary"; referencedColumns: ["id"] },
          { foreignKeyName: "workout_exercises_workout_id_fkey"; columns: ["workout_id"]; isOneToOne: false; referencedRelation: "workouts"; referencedColumns: ["id"] },
          { foreignKeyName: "workouts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      workout_summary: {
        Row: { avg_rpe: number | null; duration_minutes: number | null; id: number | null; metadata: Json | null; tags: Json | null; total_sets: number | null; total_volume: number | null; unique_exercises: number | null; user_id: string | null; workout_date: string | null }
        Relationships: [
          { foreignKeyName: "workouts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
    }
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: { Enums: {} },
} as const


