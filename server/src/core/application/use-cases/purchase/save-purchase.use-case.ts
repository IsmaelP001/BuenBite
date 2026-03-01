/**
 * Use Case: SavePurchase
 *
 * Creates a new purchase order with items.
 * Extracted from PurchaseFacadeImpl to isolate domain creation logic.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Purchase, PurchaseData, PurchaseItem } from '../../../domain/purchases.model';
import { GamificationAction, GamificationEvent } from '../../../domain/gamification.model';
import { PurchaseDto } from '../../dto';
import { PurchaseService } from '../../services/interfaces/purchase';
import { GamificationService } from '../../services/interfaces/gamification';

@Injectable()
export class SavePurchaseUseCase {
  private readonly logger = new Logger(SavePurchaseUseCase.name);

  constructor(
    @Inject('PurchaseService') private readonly purchaseService: PurchaseService,
    @Inject('GamificationService') private readonly gamificationService: GamificationService,
  ) {}

  async execute(purchaseDto: PurchaseDto): Promise<Purchase> {
    const { purchaseItems, ...purchaseDataDto } = purchaseDto;
    const purchaseId = uuidv4();

    const purchaseData: PurchaseData = {
      ...purchaseDataDto,
      id: purchaseId,
      status: 'pending',
      totalItems: purchaseItems?.length ?? 0,
      purchaseDate: new Date().toISOString(),
    };

    const items: PurchaseItem[] =
      purchaseItems?.map((item) => ({
        ...item,
        id: uuidv4(),
        purchaseId,
        amountToBuy: item.amountToBuy,
      })) || [];

    const purchase = new Purchase(purchaseData, items);
    await this.purchaseService.savePurchase(purchase);

    await this.emitGamificationEvent({
      userId: purchaseDto.userId,
      action: GamificationAction.PURCHASE_REGISTERED,
      referenceId: purchaseId,
      referenceType: 'purchase',
      metadata: { totalItems: items.length },
      timestamp: new Date(),
    });

    return purchase;
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
