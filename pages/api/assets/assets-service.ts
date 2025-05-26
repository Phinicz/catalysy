import { supabase } from "@/lib/supabase";
import { Asset } from "./asset";
import { AssetAgreement } from "./asset-agreement";
import { CreateAssetParams } from "./create-asset-params";

export class AssetsService {
  public async postAssetAgreement(
    uid: string,
    body: {
      accepted: boolean;
      role: string;
    }
  ): Promise<AssetAgreement> {
    const { error } = await supabase.from("assets-agreements").upsert([
      {
        uid,
        date: new Date().toISOString(),
        role: body.role,
        accepted: body.accepted,
      },
    ]);
    if (error) throw new Error(error.message);
    const newAgreement = await this.getAssetAgreement(uid);
    if (!newAgreement) throw new Error("Asset agreement not found");
    return newAgreement;
  }

  public async getAssetAgreement(uid: string): Promise<AssetAgreement | null> {
    const { data, error } = await supabase
      .from("assets-agreements")
      .select("*")
      .eq("uid", uid)
      .single();
    if (error || !data) return null;
    return data as AssetAgreement;
  }

  public async getAsset(uid: string): Promise<Asset> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", uid)
      .single();
    if (error || !data) throw new Error("Asset not found");
    return data as Asset;
  }

  public async getAssetByContract(address: string): Promise<Asset> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("contract", address)
      .single();
    if (error || !data) throw new Error("Asset not found");
    return data as Asset;
  }

  public async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase.from("assets").select("*");
    if (error || !data) return [];
    return data as Asset[];
  }

  public async getAssetsByIds(ids: string[]): Promise<Asset[]> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .in("id", ids);
    if (error || !data) return [];
    return data as Asset[];
  }

  public async createAsset(asset: CreateAssetParams): Promise<Asset> {
    const { data, error } = await supabase
      .from("assets")
      .insert([{ ...asset }])
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message);
    return data as Asset;
  }

  public async deleteAsset(uid: string): Promise<void> {
    const { error } = await supabase.from("assets").delete().eq("id", uid);
    if (error) {
      throw new Error(error?.message ?? "Unknown error");
    }
  }
}
