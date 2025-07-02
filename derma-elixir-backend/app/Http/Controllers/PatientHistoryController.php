<?php

namespace App\Http\Controllers;

use App\Models\PatientHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PatientHistoryController extends Controller
{
    public function getPatientHistory($patientId)
    {
        $patient = User::findOrFail($patientId);
        
        // Ensure this is a patient
        if ($patient->user_type !== 'patient') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid patient ID'
            ], 400);
        }
        
        $history = PatientHistory::with('specialist')
            ->where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'history' => $history,
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->first_name . ' ' . $patient->last_name,
                'email' => $patient->email,
                'mobile' => $patient->mobile
            ]
        ]);
    }
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'specialist_id' => 'required|exists:users,id',
            'diagnosis' => 'nullable|string',
            'medications' => 'nullable|string',
            'notes' => 'nullable|string',
            'appointment_id' => 'nullable|exists:appointments,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }
        
        $history = PatientHistory::create($request->all());
        
        return response()->json([
            'success' => true,
            'history' => $history
        ], 201);
    }
}