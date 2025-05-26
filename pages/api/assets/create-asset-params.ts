import { Asset } from "./asset";

export type CreateAssetParams = Omit<Asset, "uid">;