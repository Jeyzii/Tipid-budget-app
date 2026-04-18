<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'opening_balance' => $this->opening_balance,
            'current_balance' => $this->current_balance,
            'is_archived' => $this->is_archived,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
