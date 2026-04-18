<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->where('user_id', auth()->id())
            ->latest('id')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::query()->create([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

        return new CategoryResource($category);
    }

    public function show(string $id)
    {
        $category = Category::query()->where('user_id', auth()->id())->findOrFail($id);
        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, string $id)
    {
        $category = Category::query()->where('user_id', auth()->id())->findOrFail($id);
        $category->update($request->validated());

        return new CategoryResource($category->fresh());
    }

    public function destroy(string $id)
    {
        $category = Category::query()->where('user_id', auth()->id())->findOrFail($id);
        $category->delete();

        return response()->noContent();
    }
}
