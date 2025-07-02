<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Treatment;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Get appointments for a user
     */
    public function index(Request $request)
    {
        // Get authenticated user from session rather than token
        $userId = $request->input('user_id');
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $appointments = [];

        switch ($user->user_type) {
            case 'admin':
                // Admins can see all appointments
                $appointments = Appointment::with(['patient', 'specialist', 'treatment'])
                    ->orderBy('appointment_date', 'asc')
                    ->orderBy('appointment_time', 'asc')
                    ->get();
                break;

            case 'specialist':
                // Specialists see only their appointments
                $appointments = Appointment::with(['patient', 'treatment', 'specialist'])
                ->where('specialist_id', $user->id)
                    ->orderBy('appointment_date', 'asc')
                    ->orderBy('appointment_time', 'asc')
                    ->get();
                break;

            case 'patient':
            default:
                // Patients see only their appointments
                $appointments = Appointment::with(['specialist', 'treatment'])
                    ->where('patient_id', $user->id)
                    ->orderBy('appointment_date', 'asc')
                    ->orderBy('appointment_time', 'asc')
                    ->get();
                break;
        }

        return response()->json([
            'success' => true,
            'appointments' => $appointments
        ]);
    }

    /**
     * Create a new appointment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'specialist_id' => 'required|exists:users,id',
            'treatment_id' => 'required|exists:treatments,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        // Ensure the specialist is actually a specialist
        $specialist = User::find($request->specialist_id);
        if (!$specialist || $specialist->user_type !== 'specialist') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid specialist selected'
            ], 400);
        }
        
        // Create the appointment
        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'specialist_id' => $request->specialist_id,
            'treatment_id' => $request->treatment_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'status' => 'pending',
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Update appointment status (confirm/cancel)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'user_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $appointment = Appointment::findOrFail($id);
        $user = User::find($request->user_id);

        // Check permissions based on user role
        if ($user->user_type === 'patient' && $user->id === $appointment->patient_id) {
            // Patients can only cancel their own appointments
            if ($request->status !== 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Patients can only cancel appointments'
                ], 403);
            }
        } else if ($user->user_type === 'specialist' && $user->id === $appointment->specialist_id) {
            // Specialists can confirm, cancel, or mark as completed
            if (!in_array($request->status, ['confirmed', 'cancelled', 'completed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status update for specialist'
                ], 403);
            }
        } else if ($user->user_type !== 'admin') {
            // Not authorized
            return response()->json([
                'success' => false,
                'message' => 'Not authorized to update this appointment'
            ], 403);
        }

        // Update the appointment
        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'success' => true,
            'appointment' => $appointment
        ]);
    }

    /**
     * Get available specialists
     */
    public function getSpecialists()
    {
        $specialists = User::where('user_type', 'specialist')
            ->select('id', 'first_name', 'last_name', 'email', 'specialty', 'city', 'state')
            ->get();
    
        return response()->json([
            'success' => true,
            'specialists' => $specialists
        ]);
    }

    // reviews
    public function submitReview(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $review = Review::updateOrCreate(
            ['appointment_id' => $id],
            [
                'patient_id' => $appointment->patient_id,
                'specialist_id' => $appointment->specialist_id,
                'treatment_id' => $appointment->treatment_id,
                'rating' => $request->rating,
                'comment' => $request->comment
            ]
        );

        return response()->json(['success' => true, 'review' => $review]);
    }

    public function getAppointmentReview($id)
    {
        $review = Review::where('appointment_id', $id)->first();
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'exists' => false,
                'message' => 'No review found'
            ], 404);
        }
        
        return response()->json(['success' => true, 'review' => $review]);
    }

    public function getReviews()
    {
        $reviews = Review::with(['patient', 'specialist', 'treatment'])
            ->latest()
            ->get();
        
        return response()->json([
            'success' => true,
            'reviews' => $reviews
        ]);
    }
}