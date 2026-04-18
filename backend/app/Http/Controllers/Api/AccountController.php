<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::query()
            ->where('user_id', auth()->id())
            ->latest('id')
            ->get();

        return AccountResource::collection($accounts);
    }

    public function store(StoreAccountRequest $request)
    {
        $data = $request->validated();
        $opening = (float) ($data['opening_balance'] ?? 0);
        $account = Account::query()->create([
            ...$data,
            'user_id' => auth()->id(),
            'opening_balance' => $opening,
            'current_balance' => $opening,
        ]);

        return new AccountResource($account);
    }

    public function show(string $id)
    {
        $account = Account::query()->where('user_id', auth()->id())->findOrFail($id);
        return new AccountResource($account);
    }

    public function update(UpdateAccountRequest $request, string $id)
    {
        $account = Account::query()->where('user_id', auth()->id())->findOrFail($id);
        $account->update($request->validated());

        return new AccountResource($account->fresh());
    }

    public function destroy(string $id)
    {
        $account = Account::query()->where('user_id', auth()->id())->findOrFail($id);
        $account->delete();

        return response()->noContent();
    }
}
