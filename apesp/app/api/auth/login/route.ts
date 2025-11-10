import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';
import { prisma } from '../../../../src/lib/db';
import { comparePassword, generateToken } from '../../../../src/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
