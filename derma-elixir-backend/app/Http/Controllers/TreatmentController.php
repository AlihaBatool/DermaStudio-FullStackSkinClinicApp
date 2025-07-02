<?php

namespace App\Http\Controllers;

use App\Models\Treatment;
use Illuminate\Http\Request;

class TreatmentController extends Controller
{
    public function index()
    {
        return Treatment::all();
    }

    public function store(Request $request)
    {
        $treatment = Treatment::create($request->all());
        return response()->json($treatment, 201);
    }

    public function destroy($id)
    {
        $treatment = Treatment::findOrFail($id);
        $treatment->delete();
        return response()->json(null, 204);
    }

    public function update(Request $request, $id)
    {
        $treatment = Treatment::findOrFail($id);
        $treatment->update($request->all());
        return response()->json($treatment, 200);
    }
}