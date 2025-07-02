<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use Illuminate\Http\Request;

class LabTestController extends Controller
{
    public function index()
    {
        return LabTest::all();
    }

    public function store(Request $request)
    {
        $labTest = LabTest::create($request->all());
        return response()->json($labTest, 201);
    }

    public function destroy($id)
    {
        $labTest = LabTest::findOrFail($id);
        $labTest->delete();
        return response()->json(null, 204);
    }

    public function update(Request $request, $id)
    {
        $labTest = LabTest::findOrFail($id);
        $labTest->update($request->all());
        return response()->json($labTest, 200);
    }
}