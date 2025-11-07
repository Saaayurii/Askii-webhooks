import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('должен вернуть статус "ok"', () => {
      const result = controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });

    it('должен вернуть название приложения', () => {
      const result = controller.check();

      expect(result.service).toBe('journal-assistant');
    });

    it('должен вернуть версию приложения', () => {
      const result = controller.check();

      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
    });

    it('должен вернуть время работы (uptime)', () => {
      const result = controller.check();

      expect(result.uptime).toBeDefined();
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('должен вернуть использование памяти', () => {
      const result = controller.check();

      expect(result.memory).toBeDefined();
      expect(result.memory.used).toBeDefined();
      expect(result.memory.total).toBeDefined();
      expect(typeof result.memory.used).toBe('string');
      expect(typeof result.memory.total).toBe('string');
    });
  });
});
