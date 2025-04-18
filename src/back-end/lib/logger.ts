import { pino } from 'pino'
import pretty from 'pino-pretty'

let logger: pino.BaseLogger | null = null

const createLogger = (level?: string): pino.BaseLogger => {
  if (logger) {
    throw new Error('Client error: Logger client has already been created')
  }

  const stream = pretty({
    colorize: true,
    destination: 2 // stderr
  })

  logger = pino({ level: level ?? 'info' }, stream)
  return logger
}

const useLogger = (): pino.BaseLogger => {
  if (!logger) {
    throw new Error('Client error: Logger client has not been created')
  }

  return logger
}

export { createLogger, useLogger }
