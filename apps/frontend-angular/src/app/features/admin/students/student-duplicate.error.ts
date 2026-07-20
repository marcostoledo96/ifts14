/** Conflicto de alta: ya existe un alumno con el mismo DNI. */
export class StudentDuplicateError extends Error {
  readonly status = 409;
  readonly existingStudentId: number;

  constructor(existingStudentId: number) {
    super('Ya existe un alumno con ese documento.');
    this.name = 'StudentDuplicateError';
    this.existingStudentId = existingStudentId;
  }
}

export function existingStudentIdOf(err: unknown): number | null {
  if (err instanceof StudentDuplicateError) {
    return err.existingStudentId;
  }
  if (err && typeof err === 'object' && 'existingStudentId' in err) {
    const id = (err as { existingStudentId: unknown }).existingStudentId;
    return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
  }
  return null;
}
