import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ConfirmPurchaseDto, PurchaseItemDto } from "../../application/dto";
import { PurchaseFacade } from "../../application/services/interfaces/purchase";

@Controller("purchases")
export class PurchasesController {
  constructor(
    @Inject("PurchaseFacade")
    private readonly purchasesFacade: PurchaseFacade
  ) {}

  @Post()
  async savePurchase(
    @Body() purchaseItems: PurchaseItemDto[],
    @Req() req: any
  ) {
    const purchase = await this.purchasesFacade.savePurchase({
      userId: req.userId,
      purchaseItems,
    });
    return {
      purchase: purchase.purchaseData,
      items: purchase.purchaseItems,
    };
  }

  @Post("confirm")
  async confirmPurchase(@Body() purchaseDto: ConfirmPurchaseDto, @Req() req:any) {
        console.log('purchaseDto',purchaseDto)

    const purchase = await this.purchasesFacade.confirmPurchase({...purchaseDto,userId:req.userId,});
    return {
      purchase: purchase?.purchaseData,
      items: purchase?.purchaseItems,
    };
  }

  @Get()
  async getUserPurchases(@Query("userId") userId: string) {
    const purchases = await this.purchasesFacade.getAllUserPurchases(userId);
    return purchases;
  }


  @Get(":purchaseId")
  async getPurchaseOrder(@Param("purchaseId") purchaseId: string) {
    return await this.purchasesFacade.getPurchaseOrderById(purchaseId);
  }

  @Get(":purchaseId/items")
  async getPurchaseOrderItems(@Param("purchaseId") purchaseId: string) {
    const items = await this.purchasesFacade.getPurchaseOrderItems(purchaseId);
    return items;
  }

  @Post(":purchaseId/add-items")
  async add(
    @Param("purchaseId") purchaseId: string,
    @Body() purchaseItems: any
  ) {
    const dto = {
      purchaseId,
      items: purchaseItems,
    };

    console.log("purchaseItems", dto);
    const items = await this.purchasesFacade.addItemsToPurchase(dto);
    return items;
  }

  @Delete(":purchaseId/remove-item")
  async RemovePurchaseItem(@Param("purchaseId") purchaseItemId: string) {
    const items = await this.purchasesFacade.removePurchaseItem(purchaseItemId);
    return items;
  }
}
