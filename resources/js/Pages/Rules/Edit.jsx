import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import { ChevronLeft } from 'lucide-react';
import RuleForm from './RuleForm';

/**
 * @param {{ rule: object }} props
 */
export default function AturanEdit({ rule }) {
    const conditionsRaw = (() => {
        if (!rule.conditions_json) return '{}';
        if (typeof rule.conditions_json === 'string') return rule.conditions_json;
        try { return JSON.stringify(rule.conditions_json, null, 2); } catch { return '{}'; }
    })();

    const form = useForm({
        nama_aturan:     rule.nama_aturan ?? rule.name ?? '',
        deskripsi:       rule.deskripsi   ?? rule.description ?? '',
        category:        rule.category    ?? 'transaction',
        conditions_json: conditionsRaw,
        action:          rule.action      ?? 'alert',
        severity:        rule.severity    ?? 'medium',
        threshold:       rule.threshold   ?? '',
        is_active:       rule.is_active   ?? true,
    });

    function submit(e) {
        e.preventDefault();
        form.put(route('rules.update', rule.id));
    }

    return (
        <AppLayout title={`Edit Aturan: ${rule.nama_aturan ?? rule.name ?? ''}`}>
            <PageHeader
                title="Edit Aturan"
                subtitle={rule.nama_aturan ?? rule.name}
                actions={
                    <Link href={route('rules.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <RuleForm
                data={form.data}
                setData={form.setData}
                errors={form.errors}
                processing={form.processing}
                onSubmit={submit}
                cancelHref={route('rules.index')}
                submitLabel="Simpan Perubahan"
            />
        </AppLayout>
    );
}
