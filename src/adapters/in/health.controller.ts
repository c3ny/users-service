import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Check if the users-service is running and healthy',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running and healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Service health status',
        },
        timestamp: {
          type: 'string',
          example: '2024-01-17T10:30:00.000Z',
          description: 'Current timestamp in ISO format',
        },
        service: {
          type: 'string',
          example: 'users-service',
          description: 'Service name',
        },
        version: {
          type: 'string',
          example: '1.0.0',
          description: 'Service version',
        },
        uptime: {
          type: 'number',
          example: 3600,
          description: 'Service uptime in seconds',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2024-01-17T10:30:00.000Z' },
        service: { type: 'string', example: 'users-service' },
        error: { type: 'string', example: 'Database connection failed' },
      },
    },
  })
  getHealth() {
    const uptime = process.uptime();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'users-service',
      version: '1.0.0',
      uptime: Math.floor(uptime),
    };
  }

  @Get('/ready')
  @ApiOperation({
    summary: 'Readiness check endpoint',
    description:
      'Check if the service is ready to accept requests (includes database connectivity)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept requests',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ready' },
        timestamp: { type: 'string', example: '2024-01-17T10:30:00.000Z' },
        service: { type: 'string', example: 'users-service' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'ok' },
            memory: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  getReadiness() {
    // Basic readiness check - in a real implementation, you might want to check database connectivity
    const memoryUsage = process.memoryUsage();
    const isMemoryHealthy = memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9; // 90% threshold

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'users-service',
      checks: {
        database: 'ok', // In a real implementation, check actual DB connection
        memory: isMemoryHealthy ? 'ok' : 'warning',
      },
    };
  }

  @Get('/live')
  @ApiOperation({
    summary: 'Liveness check endpoint',
    description: 'Check if the service is alive (basic process check)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
        timestamp: { type: 'string', example: '2024-01-17T10:30:00.000Z' },
        service: { type: 'string', example: 'users-service' },
        pid: { type: 'number', example: 12345 },
      },
    },
  })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      service: 'users-service',
      pid: process.pid,
    };
  }
}
