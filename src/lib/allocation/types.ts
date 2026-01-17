export interface StudentWithPriorities {
  id: number
  priority1Id: number
  priority2Id: number | null
  priority3Id: number | null
  assignedEventId: number | null
  assignmentType: 'auto' | 'manual' | null
}

export interface EventWithCapacity {
  id: number
  capacity: number
}

export interface AllocationInput {
  students: StudentWithPriorities[]
  events: EventWithCapacity[]
  seed: string
  preserveManual: boolean
}

export interface AllocationStats {
  total: number
  got1stChoice: number
  got2ndChoice: number
  got3rdChoice: number
  sonderliste: number
}

export interface AllocationResult {
  assignments: Map<number, number | null>  // studentId -> eventId (null = sonderliste)
  sonderliste: number[]
  stats: AllocationStats
}
