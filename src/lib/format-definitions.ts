export type FieldSlug =
  | "class_name" | "week_date" | "teacher_name" | "enrollment_count" | "month_plan_week"
  | "prev_week_observation" | "weekly_goal" | "activities"
  | "child_behavior_prediction" | "teacher_support" | "environment_setup"
  | "individual_care" | "health_safety" | "food_education"
  | "family_community" | "weather_contingency" | "weekly_reflection" | "five_domains"
  | "sleep_feeding_record" | "individual_development" | "parent_communication" | "allergy_response"
  | "duty_activities" | "group_play" | "nap_record" | "school_readiness"
  | "structured_free_play" | "subject_goals" | "parent_newsletter" | "extended_care"

export type FieldGroup = "A" | "B" | "C" | "D"
export type FacilityType = "nursery_infant" | "nursery_preschool" | "kindergarten" | "combined"
export type LayoutType = "vertical" | "horizontal" | "integrated"

export interface FieldDefinition {
  slug: FieldSlug
  label: string
  group: FieldGroup
  description: string
  defaultFor: FacilityType[]
}

export const FIELD_DEFINITIONS: Record<FieldSlug, FieldDefinition> = {
  class_name:          { slug: "class_name",          label: "クラス名・年齢",         group: "A", description: "クラス名と対象年齢",               defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  week_date:           { slug: "week_date",            label: "作成日・対象週",         group: "A", description: "週案の対象となる週",               defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  teacher_name:        { slug: "teacher_name",         label: "担任者名",               group: "A", description: "担任保育士の名前",                 defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  enrollment_count:    { slug: "enrollment_count",     label: "在籍・出席人数",         group: "A", description: "クラスの在籍人数と出席予定人数",   defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  month_plan_week:     { slug: "month_plan_week",      label: "月案との対応（第◯週）", group: "A", description: "月案の何週目にあたるか",           defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  prev_week_observation:     { slug: "prev_week_observation",     label: "前週の子どもの姿",     group: "B", description: "先週の観察・振り返り",           defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  weekly_goal:               { slug: "weekly_goal",               label: "今週のねらい",         group: "B", description: "週単位の保育目標",               defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  activities:                { slug: "activities",                label: "活動内容",             group: "B", description: "遊び・制作・体験の計画",         defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  child_behavior_prediction: { slug: "child_behavior_prediction", label: "予想される子どもの姿", group: "B", description: "活動中の行動予測",               defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  teacher_support:           { slug: "teacher_support",           label: "保育者の援助・関わり", group: "B", description: "支援・指導・配慮の内容",         defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  environment_setup:         { slug: "environment_setup",         label: "環境構成",             group: "B", description: "空間・素材・道具の準備",         defaultFor: ["nursery_infant","nursery_preschool","kindergarten","combined"] },
  individual_care:      { slug: "individual_care",      label: "個別配慮",               group: "C", description: "特定の子どもへの個別対応",     defaultFor: [] },
  health_safety:        { slug: "health_safety",        label: "健康・安全配慮",         group: "C", description: "感染症・怪我への留意事項",     defaultFor: [] },
  food_education:       { slug: "food_education",       label: "食育・給食",             group: "C", description: "食の体験・マナー指導",         defaultFor: [] },
  family_community:     { slug: "family_community",     label: "家庭・地域連携",         group: "C", description: "保護者への連絡・地域との関わり", defaultFor: [] },
  weather_contingency:  { slug: "weather_contingency",  label: "天候・雨天対応",         group: "C", description: "戸外活動の代替案",             defaultFor: [] },
  weekly_reflection:    { slug: "weekly_reflection",    label: "週の反省・評価",         group: "C", description: "週末の振り返り記入欄",         defaultFor: [] },
  five_domains:         { slug: "five_domains",         label: "保育の5領域",            group: "C", description: "健康・人間関係・環境・言葉・表現", defaultFor: [] },
  sleep_feeding_record:   { slug: "sleep_feeding_record",   label: "睡眠・授乳・おむつ記録",  group: "D", description: "乳児の生活リズム記録",       defaultFor: ["nursery_infant"] },
  individual_development: { slug: "individual_development", label: "個別月齢発達記録",        group: "D", description: "月齢に応じた発達の記録",     defaultFor: ["nursery_infant"] },
  parent_communication:   { slug: "parent_communication",   label: "保護者との連絡帳連携",    group: "D", description: "連絡帳との情報連携",         defaultFor: ["nursery_infant"] },
  allergy_response:       { slug: "allergy_response",       label: "離乳食・アレルギー対応",  group: "D", description: "食事対応の個別記録",        defaultFor: ["nursery_infant"] },
  duty_activities:      { slug: "duty_activities",      label: "当番活動・係活動",       group: "D", description: "クラスの役割活動",           defaultFor: ["nursery_preschool"] },
  group_play:           { slug: "group_play",           label: "ルール遊び・集団活動",   group: "D", description: "集団でのゲーム・活動計画",   defaultFor: ["nursery_preschool"] },
  nap_record:           { slug: "nap_record",           label: "午睡の有無と記録",       group: "D", description: "午睡の計画・記録",           defaultFor: ["nursery_preschool"] },
  school_readiness:     { slug: "school_readiness",     label: "就学前準備",             group: "D", description: "小学校接続に向けた取り組み", defaultFor: ["nursery_preschool"] },
  structured_free_play: { slug: "structured_free_play", label: "課業・自由遊びの区分",   group: "D", description: "設定保育と自由遊びの計画",   defaultFor: ["kindergarten","combined"] },
  subject_goals:        { slug: "subject_goals",        label: "教科・領域別ねらい",     group: "D", description: "領域ごとの具体的目標",       defaultFor: ["kindergarten","combined"] },
  parent_newsletter:    { slug: "parent_newsletter",    label: "保護者向け連絡事項",     group: "D", description: "クラスだよりとの連携",       defaultFor: ["kindergarten","combined"] },
  extended_care:        { slug: "extended_care",        label: "預かり保育対応",         group: "D", description: "認定こども園の預かり保育計画", defaultFor: ["combined"] },
}

export const FACILITY_PRESETS: Record<FacilityType, { label: string; defaultFields: FieldSlug[] }> = {
  nursery_infant: {
    label: "保育所（0〜2歳）",
    defaultFields: [
      "class_name","week_date","teacher_name","enrollment_count","month_plan_week",
      "prev_week_observation","weekly_goal","activities","child_behavior_prediction","teacher_support","environment_setup",
      "sleep_feeding_record","individual_development","parent_communication","allergy_response",
    ],
  },
  nursery_preschool: {
    label: "保育所（3〜5歳）",
    defaultFields: [
      "class_name","week_date","teacher_name","enrollment_count","month_plan_week",
      "prev_week_observation","weekly_goal","activities","child_behavior_prediction","teacher_support","environment_setup",
      "duty_activities","group_play","nap_record","school_readiness",
    ],
  },
  kindergarten: {
    label: "幼稚園",
    defaultFields: [
      "class_name","week_date","teacher_name","enrollment_count","month_plan_week",
      "prev_week_observation","weekly_goal","activities","child_behavior_prediction","teacher_support","environment_setup",
      "structured_free_play","subject_goals","parent_newsletter",
    ],
  },
  combined: {
    label: "認定こども園",
    defaultFields: [
      "class_name","week_date","teacher_name","enrollment_count","month_plan_week",
      "prev_week_observation","weekly_goal","activities","child_behavior_prediction","teacher_support","environment_setup",
      "structured_free_play","subject_goals","parent_newsletter","extended_care",
    ],
  },
}

export const FACILITY_LABELS: Record<FacilityType, string> = {
  nursery_infant:    "保育所（0〜2歳クラス）",
  nursery_preschool: "保育所（3〜5歳クラス）",
  kindergarten:      "幼稚園",
  combined:          "認定こども園",
}

export const LAYOUT_OPTIONS: { value: LayoutType; label: string; description: string }[] = [
  { value: "vertical",    label: "縦型",         description: "曜日を行、項目を列に並べる" },
  { value: "horizontal",  label: "横型",         description: "項目を行、曜日を列に並べる" },
  { value: "integrated",  label: "週日案一体型", description: "週案と日案を1枚に統合" },
]
