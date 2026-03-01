/**
 * Use Case: ConfirmPurchase
 *
 * Orchestrates purchase confirmation + pantry item creation.
 * Extracted from PurchaseFacadeImpl to isolate cross-service logic.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Purchase, PurchaseItem } from '../../../domain/purchases.model';
import { GamificationAction, GamificationEvent } from '../../../domain/gamification.model';
import { ConfirmPurchaseDto, PantryDto } from '../../dto';
import { PantryService } from '../../services/interfaces/pantry';
import { PurchaseService } from '../../services/interfaces/purchase';
import { GamificationService } from '../../services/interfaces/gamification';

@Injectable()
export class ConfirmPurchaseUseCase {
  private readonly logger = new Logger(ConfirmPurchaseUseCase.name);

  constructor(
    @Inject('PurchaseService') private readonly purchaseService: PurchaseService,
    @Inject('PantryService') private readonly pantryService: PantryService,
    @Inject('GamificationService') private readonly gamificationService: GamificationService,
  ) {}

  async execute(dto: ConfirmPurchaseDto): Promise<Purchase> {
    const orderId = dto.purchaseId;

    const [currentPurchase, purchaseItems, pantryItems] = await Promise.all([
      this.purchaseService.getPurchaseById(orderId),
      this.purchaseService.getPurchaseOrderItems(orderId),
      this.pantryService.getUserPantry(dto.userId),
    ]);

    const { purchaseItemsToUpdate, pantryItemsDto } = dto.items.reduce(
      (acc, dtoItem) => {
        const item = purchaseItems.find((i) => i.id === dtoItem.purchaseItemId);
        if (item) {
          acc.purchaseItemsToUpdate.push({
            id: dtoItem.purchaseItemId,
            purchaseId: dtoItem.orderId,
            amountToBuy: dtoItem.amountToBuy,
            measurementType: item.measurementType,
          });

          acc.pantryItemsDto.push({
            measurementType: item.measurementType,
            measurementValue: dtoItem.amountToBuy,
            isRecurrent: false,
            userId: currentPurchase.userId,
            ingredientId: item.ingredientId,
          });
        }
        return acc;
      },
      {
        purchaseItemsToUpdate: [] as any[],
        pantryItemsDto: [] as PantryDto[],
      },
    );

    const purchase = new Purchase(currentPurchase, purchaseItemsToUpdate as PurchaseItem[]);
    purchase.confirmPurchase();

    await this.pantryService.createPantryItemsFromSource(pantryItems, pantryItemsDto, 'purchased');
    const confirmed = await this.purchaseService.confirmPurchase(purchase);

    await this.emitGamificationEvent({
      userId: dto.userId,
      action: GamificationAction.PURCHASE_REGISTERED,
      referenceId: dto.purchaseId,
      referenceType: 'purchase',
      metadata: { totalItems: purchaseItemsToUpdate.length },
      timestamp: new Date(),
    });

    return confirmed;
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
