export type TeamMember = {
  id: string
  name: string
  avatar: string
  status: "synced" | "pending" | "expired"
  exerciseType: "running" | "gym"
  todayDistance?: number
  todayGoal?: number
  gymMinutes?: number
  gymGoal?: number
  streak: number
  trustScore: number
  sosRemaining: number
}

export type Team = {
  id: string
  name: string
  hp: number
  maxHp: number
  streakDays: number
  totalDistance: number
  totalGymHours: number
  members: TeamMember[]
  createdAt: string
}

export type ActivityLog = {
  id: string
  memberId: string
  memberName: string
  type: "running" | "gym"
  timestamp: string
  distance?: number
  duration?: number
  gpsPath?: [number, number][]
  status: "approved" | "pending_review" | "flagged"
  reviewedBy: string[]
}

export type Notification = {
  id: string
  type: "pressure" | "celebration" | "sos" | "alert" | "review"
  message: string
  timestamp: string
  read: boolean
}

export const mockTeam: Team = {
  id: "team-001",
  name: "鉄の意志",
  hp: 78,
  maxHp: 100,
  streakDays: 12,
  totalDistance: 156.4,
  totalGymHours: 34.5,
  members: [
    {
      id: "user-1",
      name: "田中 太郎",
      avatar: "T",
      status: "synced",
      exerciseType: "running",
      todayDistance: 5.2,
      todayGoal: 5.0,
      streak: 12,
      trustScore: 92,
      sosRemaining: 1,
    },
    {
      id: "user-2",
      name: "佐藤 花子",
      avatar: "H",
      status: "pending",
      exerciseType: "gym",
      gymMinutes: 0,
      gymGoal: 30,
      streak: 10,
      trustScore: 88,
      sosRemaining: 1,
    },
    {
      id: "user-3",
      name: "鈴木 健太",
      avatar: "K",
      status: "synced",
      exerciseType: "running",
      todayDistance: 6.1,
      todayGoal: 5.0,
      streak: 12,
      trustScore: 95,
      sosRemaining: 0,
    },
  ],
  createdAt: "2026-01-26",
}

export const mockActivities: ActivityLog[] = [
  {
    id: "act-1",
    memberId: "user-1",
    memberName: "田中 太郎",
    type: "running",
    timestamp: "2026-02-07T07:30:00",
    distance: 5.2,
    gpsPath: [
      [35.6762, 139.6503],
      [35.6785, 139.6525],
      [35.681, 139.655],
      [35.6835, 139.6575],
      [35.686, 139.66],
    ],
    status: "approved",
    reviewedBy: ["user-3"],
  },
  {
    id: "act-2",
    memberId: "user-3",
    memberName: "鈴木 健太",
    type: "running",
    timestamp: "2026-02-07T06:15:00",
    distance: 6.1,
    gpsPath: [
      [35.69, 139.7],
      [35.692, 139.703],
      [35.694, 139.706],
      [35.696, 139.709],
      [35.698, 139.712],
    ],
    status: "pending_review",
    reviewedBy: [],
  },
  {
    id: "act-3",
    memberId: "user-2",
    memberName: "佐藤 花子",
    type: "gym",
    timestamp: "2026-02-06T18:00:00",
    duration: 45,
    status: "approved",
    reviewedBy: ["user-1", "user-3"],
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "n-1",
    type: "pressure",
    message: "佐藤 花子さんがまだ今日の運動を完了していません",
    timestamp: "2026-02-07T21:00:00",
    read: false,
  },
  {
    id: "n-2",
    type: "celebration",
    message: "田中 太郎さんが5km走破しました！",
    timestamp: "2026-02-07T07:35:00",
    read: true,
  },
  {
    id: "n-3",
    type: "celebration",
    message: "鈴木 健太さんが6.1km走破しました！",
    timestamp: "2026-02-07T06:20:00",
    read: true,
  },
  {
    id: "n-4",
    type: "alert",
    message: "残り3時間！今日の期限が迫っています",
    timestamp: "2026-02-07T21:00:00",
    read: false,
  },
  {
    id: "n-5",
    type: "review",
    message: "鈴木 健太さんのランニング記録の確認をお願いします",
    timestamp: "2026-02-07T06:25:00",
    read: false,
  },
]

export const mockWeeklyData = [
  { day: "月", you: 5.2, member2: 0, member3: 6.1 },
  { day: "火", you: 4.8, member2: 30, member3: 5.5 },
  { day: "水", you: 5.0, member2: 45, member3: 5.0 },
  { day: "木", you: 0, member2: 35, member3: 6.0 },
  { day: "金", you: 5.5, member2: 40, member3: 0 },
  { day: "土", you: 7.2, member2: 50, member3: 8.1 },
  { day: "日", you: 5.2, member2: 0, member3: 6.1 },
]

export const mockHpHistory = [
  { day: "1/27", hp: 100 },
  { day: "1/28", hp: 100 },
  { day: "1/29", hp: 95 },
  { day: "1/30", hp: 100 },
  { day: "1/31", hp: 85 },
  { day: "2/1", hp: 90 },
  { day: "2/2", hp: 85 },
  { day: "2/3", hp: 75 },
  { day: "2/4", hp: 80 },
  { day: "2/5", hp: 78 },
  { day: "2/6", hp: 78 },
  { day: "2/7", hp: 78 },
]
