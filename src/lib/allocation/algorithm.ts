import { mulberry32, hashSeed, createShuffler } from './random'
import type {
  AllocationInput,
  AllocationResult,
  AllocationStats,
  StudentWithPriorities,
} from './types'

/**
 * Try to assign a student to an event if capacity allows.
 * Returns true if assignment was successful.
 */
function tryAssign(
  eventId: number,
  studentId: number,
  remaining: Map<number, number>,
  assignments: Map<number, number | null>
): boolean {
  const capacity = remaining.get(eventId)
  if (capacity === undefined || capacity <= 0) {
    return false
  }
  remaining.set(eventId, capacity - 1)
  assignments.set(studentId, eventId)
  return true
}

/**
 * Calculate allocation statistics
 */
function calculateStats(
  assignments: Map<number, number | null>,
  students: StudentWithPriorities[]
): AllocationStats {
  const stats: AllocationStats = {
    total: students.length,
    got1stChoice: 0,
    got2ndChoice: 0,
    got3rdChoice: 0,
    sonderliste: 0,
  }

  for (const student of students) {
    const assignedEventId = assignments.get(student.id)
    if (assignedEventId === null || assignedEventId === undefined) {
      stats.sonderliste++
    } else if (assignedEventId === student.priority1Id) {
      stats.got1stChoice++
    } else if (assignedEventId === student.priority2Id) {
      stats.got2ndChoice++
    } else if (assignedEventId === student.priority3Id) {
      stats.got3rdChoice++
    }
  }

  return stats
}

/**
 * Pure allocation function - fair lottery algorithm
 *
 * Priority-weighted round-robin:
 * 1. Process all 1st choices first (shuffled for fairness)
 * 2. Process remaining students' 2nd choices
 * 3. Process remaining students' 3rd choices
 * 4. Anyone still unassigned goes to Sonderliste
 *
 * IMPORTANT: This is a pure function with no side effects.
 * Same input always produces the same output.
 */
export function allocate(input: AllocationInput): AllocationResult {
  // Initialize RNG from seed
  const rng = mulberry32(hashSeed(input.seed))
  const shuffle = createShuffler(rng)

  // Build capacity tracker: eventId -> remaining capacity
  const remaining = new Map<number, number>()
  for (const event of input.events) {
    remaining.set(event.id, event.capacity)
  }

  // Separate students into toProcess (new) and preserve (manual overrides)
  const assignments = new Map<number, number | null>()
  const toProcess: number[] = []
  const studentMap = new Map<number, StudentWithPriorities>()

  for (const student of input.students) {
    studentMap.set(student.id, student)

    if (input.preserveManual && student.assignmentType === 'manual') {
      // Preserve manual assignment
      assignments.set(student.id, student.assignedEventId)
      // Deduct from remaining capacity if assigned to an event
      if (student.assignedEventId !== null) {
        const currentCapacity = remaining.get(student.assignedEventId)
        if (currentCapacity !== undefined) {
          remaining.set(student.assignedEventId, currentCapacity - 1)
        }
      }
    } else {
      // Add to processing queue
      toProcess.push(student.id)
    }
  }

  // Round 1: First choices
  const round1 = shuffle([...toProcess])
  const afterRound1: number[] = []
  for (const studentId of round1) {
    const student = studentMap.get(studentId)!
    if (!tryAssign(student.priority1Id, studentId, remaining, assignments)) {
      afterRound1.push(studentId)
    }
  }

  // Round 2: Second choices (remaining students)
  const round2 = shuffle([...afterRound1])
  const afterRound2: number[] = []
  for (const studentId of round2) {
    const student = studentMap.get(studentId)!
    // Skip if no second priority set
    if (student.priority2Id === null || !tryAssign(student.priority2Id, studentId, remaining, assignments)) {
      afterRound2.push(studentId)
    }
  }

  // Round 3: Third choices (remaining students)
  const round3 = shuffle([...afterRound2])
  const afterRound3: number[] = []
  for (const studentId of round3) {
    const student = studentMap.get(studentId)!
    // Skip if no third priority set
    if (student.priority3Id === null || !tryAssign(student.priority3Id, studentId, remaining, assignments)) {
      afterRound3.push(studentId)
    }
  }

  // Sonderliste: anyone still unassigned
  const sonderliste = afterRound3
  for (const studentId of sonderliste) {
    assignments.set(studentId, null)
  }

  // Calculate statistics
  const stats = calculateStats(assignments, input.students)

  return {
    assignments,
    sonderliste,
    stats,
  }
}
