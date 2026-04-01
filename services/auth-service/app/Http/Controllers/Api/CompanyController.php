<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompanyController extends BaseApiController
{
    /**
     * List all companies with pagination (Super Admin only)
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->query('per_page', 20), 100);

        $companies = Company::withCount('users')
            ->when($request->query('search'), function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->respondSuccess($companies);
    }

    /**
     * Create a new company and its first admin (Super Admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name'   => 'required|string|max:255',
            'plan'           => 'required|string|in:free,pro,enterprise',
            'admin_name'     => 'required|string|max:255',
            'admin_email'    => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        try {
            $result = DB::transaction(function () use ($validated) {
                $company = Company::create([
                    'name'      => $validated['company_name'],
                    'plan'      => $validated['plan'],
                    'is_active' => true,
                ]);

                $user = User::create([
                    'name'       => $validated['admin_name'],
                    'email'      => $validated['admin_email'],
                    'password'   => $validated['admin_password'],
                    'role'       => 'admin',
                    'company_id' => $company->id,
                    'is_active'  => true,
                ]);

                // syncRoles is auto-triggered by the model's booted() method,
                // but we call it explicitly in transaction to ensure consistency.
                $user->syncRoles('admin');

                return [
                    'company' => $company,
                    'user'    => $user->only(['id', 'name', 'email', 'role']),
                ];
            });

            return $this->respondSuccess($result, 'Entreprise et administrateur créés avec succès', 201);

        } catch (\Exception $e) {
            Log::error('Company creation failed', ['error' => $e->getMessage()]);
            return $this->respondError('Erreur lors de la création de l\'entreprise.', 500);
        }
    }

    /**
     * Toggle company active status (Super Admin only)
     */
    public function toggleStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $company = Company::find($id);

        if (!$company) {
            return $this->respondNotFound('Entreprise introuvable.');
        }

        $company->update(['is_active' => $validated['is_active']]);

        // Deactivate/reactivate all users of this company
        $company->users()->update(['is_active' => $validated['is_active']]);

        $status = $validated['is_active'] ? 'activée' : 'désactivée';

        return $this->respondSuccess(
            $company->loadCount('users'),
            "Entreprise {$status} avec succès."
        );
    }

    /**
     * Get global platform statistics (Super Admin only)
     */
    public function stats()
    {
        $totalCompanies = Company::count();
        $activeUsers = User::where('is_active', true)->count();
        
        $planDistribution = Company::select('plan', DB::raw('count(*) as total'))
            ->groupBy('plan')
            ->get()
            ->pluck('total', 'plan');

        return $this->respondSuccess([
            'total_companies'   => $totalCompanies,
            'active_users'      => $activeUsers,
            'plan_distribution' => $planDistribution,
            'sla_status'        => '99.9%', // Hardcoded for now as requested
        ]);
    }
}
