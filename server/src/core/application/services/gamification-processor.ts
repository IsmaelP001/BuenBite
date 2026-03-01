import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { GamificationAlert, GamificationEvent } from "../../domain/gamification.model";
import { GamificationRepository } from "../../domain/repositories";
import { ProcessGamificationEventUseCase } from "../use-cases/gamification/process-gamification-event.use-case";
import { ProcessGamificationDeferredUseCase } from "../use-cases/gamification/process-gamification-deferred.use-case";
import {
  GAMIFICATION_ALERTS_QUEUE,
  GAMIFICATION_CRITICAL_QUEUE,
  GAMIFICATION_DEFERRED_QUEUE,
} from "./gamification-service-impl";

@Processor(GAMIFICATION_CRITICAL_QUEUE)
export class GamificationCriticalProcessor extends WorkerHost {
  private readonly logger = new Logger(GamificationCriticalProcessor.name);

  constructor(
    private readonly processEventUC: ProcessGamificationEventUseCase,
  ) {
    super();
  }

  async process(job: Job<GamificationEvent>): Promise<void> {
    this.logger.log(
      `Processing job ${job.id}: ${job.name} for user ${(job.data as any).userId}`,
    );

    try {
      await this.processEventUC.execute(job.data);
      this.logger.log(`Job ${job.id} completed successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error processing job ${job.id}: ${error?.message}`,
        error?.stack,
      );
      throw error; // BullMQ will retry based on job config
    }
  }
}

@Processor(GAMIFICATION_DEFERRED_QUEUE)
export class GamificationDeferredProcessor extends WorkerHost {
  private readonly logger = new Logger(GamificationDeferredProcessor.name);

  constructor(
    private readonly deferredUC: ProcessGamificationDeferredUseCase,
  ) {
    super();
  }

  async process(job: Job<GamificationEvent>): Promise<void> {
    this.logger.log(
      `Processing deferred job ${job.id}: ${job.name} for user ${(job.data as any).userId}`,
    );

    try {
      await this.deferredUC.execute(job.data);
      this.logger.log(`Deferred job ${job.id} completed successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error processing deferred job ${job.id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }
}

@Processor(GAMIFICATION_ALERTS_QUEUE)
export class GamificationAlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(GamificationAlertsProcessor.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
  ) {
    super();
  }

  async process(job: Job<GamificationAlert>): Promise<void> {
    this.logger.log(
      `Processing alerts job ${job.id}: ${job.name} for user ${(job.data as any).userId}`,
    );

    try {
      await this.handlePersistAlert(job);
      this.logger.log(`Alerts job ${job.id} completed successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error processing alerts job ${job.id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  private async handlePersistAlert(job: Job<GamificationAlert>): Promise<void> {
    const alert = job.data;
    await this.repo.createAlert(alert);
    this.logger.log(
      `Alert persisted to DB: ${alert.alertType} for user ${alert.userId}`,
    );
  }
}
