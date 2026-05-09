import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import { ChevronLeft } from 'lucide-react';
import RuleForm from './RuleForm';

export default function AturanCreate() {
    const form = useForm({
        nama_aturan:     '',
        deskripsi:       '',
        category:        'transaction',
        conditions_json: '{\n  "field": "jumlah",\n  "operator": "gt",\n  "value": 100000000\n}',
        action:          'alert',
        severity:        'medium',
        threshold:       '',
        is_active:       true,
    });

    function submit(e) {
        e.preventDefault();
        form.post(route('rules.store'));
    }

    return (
        <AppLayout title="Tambah Aturan Screening">
            <PageHeader
                title="Tambah Aturan Screening"
                subtitle="Buat aturan deteksi baru untuk screening transaksi dan nasabah"
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
                submitLabel="Simpan Aturan"
            />
        </AppLayout>
    );
}
