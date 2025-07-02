<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Certificate;
use App\Models\License;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $request) 
    {
        $validationRules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|unique:users|max:255',
            'email' => 'required|string|email|unique:users|max:255',
            'password' => 'required|string|min:8',
            'mobile' => 'required|string|max:20',
            'cnic' => 'required|string|unique:users|max:20',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'user_type' => 'required|string|in:patient,specialist',
        ];
        
        // Add conditional validation rules based on user type
        if ($request->user_type === 'patient') {
            $validationRules['certificate_file'] = 'required|file|mimes:pdf|max:5120'; // 5MB max, pdf only
        } else if ($request->user_type === 'specialist') {
            $validationRules['specialty'] = 'nullable|string|max:255';
            $validationRules['license_file'] = 'nullable|file|mimes:pdf|max:5120'; // Optional, 5MB max, pdf only
        }

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        // Create the user
        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mobile' => $request->mobile,
            'cnic' => $request->cnic,
            'state' => $request->state,
            'city' => $request->city,
            'user_type' => $request->user_type,
        ];
        
        // Add specialty for specialists
        if ($request->user_type === 'specialist' && $request->has('specialty')) {
            $userData['specialty'] = $request->specialty;
        }
        
        $user = User::create($userData);

        // For patients, store the certificate
        if ($request->user_type === 'patient') {
            // Certificate file is required for patients
            if (!$request->hasFile('certificate_file')) {
                return response()->json([
                    'success' => false,
                    'errors' => ['certificate_file' => 'Certificate file is required for patient registration']
                ], 400);
            }

            // Store the certificate file in the storage
            $path = $request->file('certificate_file')->store('certificates', 'public');

            // Create certificate record in the database
            Certificate::create([
                'user_id' => $user->id,
                'file_path' => $path,
                'file_name' => $request->file('certificate_file')->getClientOriginalName(),
                'created_at' => now(),
            ]);

            // Update user with certificate status
            $user->update([
                'has_certificate' => true
            ]);
        }
        
        // For specialists, store the license if provided
        if ($request->user_type === 'specialist' && $request->hasFile('license_file')) {
            // Store the license file in the storage
            $path = $request->file('license_file')->store('licenses', 'public');
            
            // Create license record in the database
            License::create([
                'user_id' => $user->id,
                'file_path' => $path,
                'file_name' => $request->file('license_file')->getClientOriginalName(),
                'created_at' => now(),
            ]);
            
            // Update user with license status
            $user->update([
                'has_license' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    public function getUsers()
    {
        $users = User::all();
        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'mobile' => 'required|string|max:20',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $updateData = $request->only([
            'first_name', 'last_name', 'email', 'mobile', 'state', 'city'
        ]);
        
        // Add specialty for specialists if provided
        if ($user->user_type === 'specialist' && $request->has('specialty')) {
            $updateData['specialty'] = $request->specialty;
        }
        
        $user->update($updateData);

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    public function getUserCertificate($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->user_type !== 'patient' || !$user->has_certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found'
            ], 404);
        }
        
        $certificate = Certificate::where('user_id', $id)->latest()->first();
        
        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found'
            ], 404);
        }
        
        // Check if file exists in storage
        if (!Storage::disk('public')->exists($certificate->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate file not found'
            ], 404);
        }
        
        // Return the file for download
        return response()->download(
            storage_path('app/public/' . $certificate->file_path),
            $certificate->file_name
        );
    }

    public function getUserLicense($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->user_type !== 'specialist' || !$user->has_license) {
            return response()->json([
                'success' => false,
                'message' => 'License not found'
            ], 404);
        }
        
        $license = License::where('user_id', $id)->latest()->first();
        
        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'License not found'
            ], 404);
        }
        
        // Check if file exists in storage
        if (!Storage::disk('public')->exists($license->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'License file not found'
            ], 404);
        }
        
        // Return the file for download
        return response()->download(
            storage_path('app/public/' . $license->file_path),
            $license->file_name
        );
    }
}
