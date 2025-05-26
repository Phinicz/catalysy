import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { Asset } from "./asset";
import { AssetsService } from "./assets-service";
import { CreateAssetParams } from "./create-asset-params";
import { AssetAgreement } from "./asset-agreement";

@Route("assets")
@Tags("Assets")
export class AssetsController extends Controller {
  @Security("jwt")
  @Get("agreement")
  public async getAssetsAgreement(
    @Request() request: any,
  ): Promise<AssetAgreement | null> {
    const assetAgreement = await new AssetsService().getAssetAgreement(request.user.uid);
    return assetAgreement;
  }

  @Security("jwt")
  @Post("agreement")
  public async postAssetsAgreement(
    @Request() request: any,
    @Body() body: {
      accepted: boolean;
      role: string;
    },
  ): Promise<AssetAgreement> {
    if (body.accepted !== true) {
      throw new Error('You must accept the agreement');
    }
    const assetAgreement = await new AssetsService().postAssetAgreement(request.user.uid, body);
    return assetAgreement;
  }

  @Security("jwt")
  @Get("")
  public async getAssets(
  ): Promise<Asset[]> {
    const assets = await new AssetsService().getAssets();
    return assets;
  }

  @Security("jwt", ["admin"])
  @Post("")
  public async createAsset(
    @Body() body: CreateAssetParams,
  ): Promise<Asset> {
    const asset = await new AssetsService().createAsset(body);
    return asset;
  }

  @Security("jwt", ["admin"])
  @Delete("{uid}")
  public async deleteAsset(
    uid: string,
  ): Promise<void> {
    await new AssetsService().deleteAsset(uid);
  }
}