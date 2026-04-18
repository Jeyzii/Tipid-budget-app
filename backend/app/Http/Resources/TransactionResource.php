<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_id' => $this->account_id,
            'category_id' => $this->category_id,
            'spending_bucket' => $this->spending_bucket,
            'type' => $this->type,
            'amount' => $this->amount,
            'description' => $this->description,
            'transaction_date' => $this->transaction_date,
            'reference_no' => $this->reference_no,
            'related_transfer_id' => $this->related_transfer_id,
            'created_by_source' => $this->created_by_source,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
