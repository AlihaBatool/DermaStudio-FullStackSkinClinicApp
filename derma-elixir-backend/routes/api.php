<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientHistoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Users Routes
    Route::get('/users', [AuthController::class, 'getUsers']);
    Route::put('/users/{id}', [AuthController::class, 'updateProfile']);
    Route::get('/users/{id}/certificate', [AuthController::class, 'getUserCertificate']);
    Route::get('/users/{id}/license', [AuthController::class, 'getUserLicense']);

    // Treatment Routes
    Route::get('/treatments', [TreatmentController::class, 'index']);
    Route::post('/treatments', [TreatmentController::class, 'store']);
    Route::delete('/treatments/{id}', [TreatmentController::class, 'destroy']);
    Route::put('/treatments/{id}', [TreatmentController::class, 'update']);
    
    // Appointment Routes
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('/appointments/{id}/review', [AppointmentController::class, 'submitReview']);
    Route::get('/appointments/{id}/review', [AppointmentController::class, 'getAppointmentReview']);
    Route::get('/reviews', [AppointmentController::class, 'getReviews']);

    // Get specialists for appointment booking
    Route::get('/specialists', [AppointmentController::class, 'getSpecialists']);

    // Lab Tests Routes
    Route::get('/lab-tests', [App\Http\Controllers\LabTestController::class, 'index']);
    Route::post('/lab-tests', [App\Http\Controllers\LabTestController::class, 'store']);
    Route::put('/lab-tests/{id}', [App\Http\Controllers\LabTestController::class, 'update']);
    Route::delete('/lab-tests/{id}', [App\Http\Controllers\LabTestController::class, 'destroy']);

    // Patient History Routes
    Route::get('/patients/{id}/history', [PatientHistoryController::class, 'getPatientHistory']);
    Route::post('/patient-history', [PatientHistoryController::class, 'store']);
});